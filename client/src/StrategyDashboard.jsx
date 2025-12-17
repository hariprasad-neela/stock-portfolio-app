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

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Investment Strategy</h1>
                    <p className="text-slate-500">Track your open positions and performance</p>
                </div>
                
                <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 flex items-center">
                    <span className="px-3 text-sm font-semibold text-slate-500">Asset:</span>
                    <select 
                        className="bg-transparent border-none focus:ring-0 font-bold text-brand cursor-pointer"
                        value={selectedTicker}
                        onChange={(e) => setSelectedTicker(e.target.value)}
                    >
                        {SUPPORTED_STOCKS.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker}</option>)}
                    </select>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Units Held" value={units_held.toFixed(2)} icon="📦" color="text-slate-900" />
                <MetricCard 
                    title="Avg. Buy Price" 
                    value={`₹${average_buy_price.toFixed(2)}`} 
                    icon="🏷️" 
                    color="text-brand" 
                />
                <MetricCard 
                    title="Capital Deployed" 
                    value={`₹${capital_deployed.toLocaleString('en-IN')}`} 
                    icon="💰" 
                    color="text-slate-900" 
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Open Inventory Lots</h3>
                </div>
                <div className="p-0">
                    <OpenInventoryTracker ticker={selectedTicker} openLots={openLots} />
                </div>
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