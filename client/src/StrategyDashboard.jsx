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
        <div className="space-y-10 max-w-6xl mx-auto px-4 py-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-8 gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Investment Strategy</h2>
                    <p className="text-slate-500 font-medium">Monitoring {selectedTicker} performance and lot history.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <span className="pl-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Asset</span>
                    <select 
                        className="bg-slate-50 border-none rounded-xl font-bold text-blue-600 focus:ring-0 cursor-pointer py-2 px-4"
                        value={selectedTicker}
                        onChange={(e) => setSelectedTicker(e.target.value)}
                    >
                        {SUPPORTED_STOCKS.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker}</option>)}
                    </select>
                </div>
            </div>

            {/* Premium Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <MetricTile label="Units Held" value={metrics.units.toFixed(2)} sub="Total Shares" color="text-slate-900" />
                <MetricTile label="Avg. Buy Price" value={`₹${metrics.abp.toFixed(2)}`} sub="Cost Basis" color="text-blue-600" />
                <MetricTile label="Capital Deployed" value={`₹${metrics.capital.toLocaleString('en-IN')}`} sub="Total Investment" color="text-slate-900" />
            </div>

            {/* Inventory Table Container */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden transition-all duration-500">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Open Inventory Lots</h3>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                </div>
                <OpenInventoryTracker ticker={selectedTicker} openLots={openLots} />
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