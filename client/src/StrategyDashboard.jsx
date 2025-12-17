// client/src/StrategyDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import { SUPPORTED_STOCKS } from './constants';
import OpenInventoryTracker from './OpenInventoryTracker';

const StrategyDashboard = () => {
    const [selectedTicker, setSelectedTicker] = useState(SUPPORTED_STOCKS[0].ticker);
    const [openLots, setOpenLots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({ units: 0, abp: 0, capital: 0 });

    const fetchData = useCallback(async (ticker) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/strategy/open-inventory/${ticker}`);
            const lots = res.data;
            let units = 0, cost = 0;
            lots.forEach(l => {
                units += parseFloat(l.open_quantity);
                cost += (parseFloat(l.open_quantity) * parseFloat(l.buy_price));
            });
            setOpenLots(lots);
            setMetrics({ units, abp: units > 0 ? cost / units : 0, capital: cost });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(selectedTicker); }, [selectedTicker, fetchData]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header Card */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portfolio Strategy</h1>
                        <p className="text-slate-500 font-medium">Real-time inventory for {selectedTicker}</p>
                    </div>
                    
                    <div className="bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm flex items-center">
                        <span className="px-3 text-xs font-bold text-slate-400 uppercase">Asset</span>
                        <select 
                            className="bg-slate-50 border-none rounded-lg font-bold text-blue-600 focus:ring-0 cursor-pointer text-sm"
                            value={selectedTicker}
                            onChange={(e) => setSelectedTicker(e.target.value)}
                        >
                            {SUPPORTED_STOCKS.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker}</option>)}
                        </select>
                    </div>
                </div>

                {/* 3-Column Grid: This creates the Card Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Units Held</p>
                        <p className="text-3xl font-black text-slate-900">0.00</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg. Buy Price</p>
                        <p className="text-3xl font-black text-blue-600">₹0.00</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capital Deployed</p>
                        <p className="text-3xl font-black text-slate-900">₹0</p>
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Open Inventory Tracker</h2>
                    </div>
                    <OpenInventoryTracker ticker={selectedTicker} openLots={[]} />
                </div>
            </div>
        </div>
    );
};

const MetricTile = ({ label, value, sub, color }) => (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{label}</p>
        <p className={`text-4xl font-black tracking-tight ${color}`}>{value}</p>
        <p className="text-xs text-slate-400 mt-2 font-medium">{sub}</p>
    </div>
);

export default StrategyDashboard;