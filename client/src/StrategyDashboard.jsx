// client/src/StrategyDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import { SUPPORTED_STOCKS } from './constants';
import OpenInventoryTracker from './OpenInventoryTracker';

const StrategyDashboard = () => {
    const [selectedTicker, setSelectedTicker] = useState(SUPPORTED_STOCKS[0].ticker);
    const [openLots, setOpenLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calculatedMetrics, setCalculatedMetrics] = useState({
        units_held: 0, average_buy_price: 0, capital_deployed: 0
    });

    const fetchInventory = useCallback(async (ticker) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/strategy/open-inventory/${ticker}`);
            const lots = response.data;

            let totalUnits = 0;
            let totalCost = 0;
            lots.forEach(lot => {
                totalUnits += parseFloat(lot.open_quantity);
                totalCost += (parseFloat(lot.open_quantity) * parseFloat(lot.buy_price));
            });

            setOpenLots(lots);
            setCalculatedMetrics({
                units_held: totalUnits,
                average_buy_price: totalUnits > 0 ? totalCost / totalUnits : 0,
                capital_deployed: totalCost
            });
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInventory(selectedTicker); }, [selectedTicker, fetchInventory]);

    const { units_held, average_buy_price, capital_deployed } = calculatedMetrics;

    const StatBox = ({ label, value, detail, primary }) => (
        <div className={`p-6 rounded-2xl border transition-all ${primary ? 'bg-blue-600 border-blue-500 shadow-blue-200 shadow-lg' : 'bg-white border-slate-200 shadow-sm'}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${primary ? 'text-blue-100' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-3xl font-bold ${primary ? 'text-white' : 'text-slate-900'}`}>{value}</p>
            <p className={`text-xs mt-2 ${primary ? 'text-blue-200' : 'text-slate-500'}`}>{detail}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Strategy Overview</h2>
                    <p className="text-slate-500 mt-1">Real-time breakdown of {selectedTicker} positions.</p>
                </div>

                <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                    {SUPPORTED_STOCKS.map(s => (
                        <button
                            key={s.ticker}
                            onClick={() => setSelectedTicker(s.ticker)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${selectedTicker === s.ticker ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {s.ticker}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox label="Units Held" value={units_held.toLocaleString()} detail="Total Inventory" />
                <StatBox label="Avg. Price" value={`₹${average_buy_price.toFixed(2)}`} detail="Cost Basis" />
                <StatBox label="Investment" value={`₹${capital_deployed.toLocaleString()}`} detail="Total Value" primary />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs">Open Lots</h3>
                </div>
                <OpenInventoryTracker ticker={selectedTicker} openLots={openLots} />
            </div>
        </div>
    );

};

// Reusable Metric Card Component
const MetricCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</span>
            <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
        </div>
        <div className={`text-3xl font-black ${color}`}>{value}</div>
    </div>
);

export default StrategyDashboard;