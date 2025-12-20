// client/src/StrategyDashboard.jsx
import { useSelector, useDispatch } from 'react-redux';
import { setTicker, fetchOpenLots, updateMetrics } from '../store/slices/portfolioSlice';
import React, { useEffect, useCallback, useState } from 'react';
import api from '../api';
import { SUPPORTED_STOCKS } from '../constants';
import OpenInventoryTracker from '../OpenInventoryTracker';

const StrategyDashboard = ({ onSellTriggered }) => {
    // const [metrics, setMetrics] = useState({ units: 0, abp: 0, capital: 0 });
    const dispatch = useDispatch();
    const { selectedTicker, openLots, loading, metrics } = useSelector((state) => state.portfolio);

    useEffect(() => {
        dispatch(fetchOpenLots(selectedTicker));
    }, [selectedTicker, dispatch]);

    const handleTickerChange = (ticker) => {
        dispatch(setTicker(ticker));
    };

    const fetchData = useCallback(async (ticker) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/strategy/open-inventory/${ticker}`);
            const lots = res.data; // Verify this is an array in console

            let totalUnits = 0;
            let totalCost = 0;

            lots.forEach(lot => {
                // Ensure we handle strings from backend
                const qty = parseFloat(lot.open_quantity);
                const price = parseFloat(lot.buy_price);

                totalUnits += qty;
                totalCost += (qty * price);
            });

            // setOpenLots(lots);
            dispatch(updateMetrics({
                units: totalUnits,
                abp: totalUnits > 0 ? totalCost / totalUnits : 0,
                capital: totalCost
            }));
        } catch (err) {
            console.error("API Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(selectedTicker);
    }, [selectedTicker, fetchData]);

    // Replace the old calculation useEffect with one that dispatches to Redux
    useEffect(() => {
        if (openLots.length > 0) {
            const totalUnits = openLots.reduce((sum, lot) => sum + parseFloat(lot.open_quantity), 0);
            const totalCapital = openLots.reduce((sum, lot) => 
                sum + (parseFloat(lot.open_quantity) * parseFloat(lot.buy_price)), 0);
            const avgPrice = totalUnits > 0 ? totalCapital / totalUnits : 0;

            // Update Redux Store
            dispatch(updateMetrics({
                units: totalUnits,
                capital: totalCapital,
                abp: avgPrice
            }));
        }
    }, [openLots, dispatch]);

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-slate-200 pb-8 gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center lg:text-left">
                        Strategy Dashboard
                    </h2>
                    <p className="text-slate-500 font-medium text-center lg:text-left">
                        Monitoring {selectedTicker} performance
                    </p>
                </div>

                {/* Responsive Ticker Selector */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full lg:w-auto">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <span className="hidden sm:block pl-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Select Asset
                        </span>
                        <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                            {SUPPORTED_STOCKS.map(s => (
                                <button
                                    key={s.ticker}
                                    onClick={() => setSelectedTicker(s.ticker)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTicker === s.ticker
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {s.ticker}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Units Held" value={metrics.units.toFixed(2)} detail="Quantity" />
                <StatCard label="Avg. Price" value={`₹${metrics.abp.toFixed(2)}`} detail="Cost Basis" highlight />
                <StatCard label="Investment" value={`₹${metrics.capital.toLocaleString('en-IN')}`} detail="Capital Deployed" />
            </div>

            {/* Inventory Table Container */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Inventory Lots</h3>
                    {loading && <span className="text-xs text-blue-500 animate-pulse font-bold">Refreshing...</span>}
                </div>
                {/* PASSING DATA TO TABLE HERE */}
                <OpenInventoryTracker
                    ticker={selectedTicker}
                    openLots={openLots}
                    onSellTriggered={onSellTriggered}
                />
            </div>
        </div>
    );
};

const StatCard = ({ label, value, detail, highlight }) => (
    <div className={`p-8 rounded-3xl border transition-all ${highlight ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-100' : 'bg-white border-slate-100 shadow-sm'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${highlight ? 'text-blue-100' : 'text-slate-400'}`}>{label}</p>
        <p className={`text-4xl font-black tracking-tighter ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        <p className={`text-xs mt-2 font-medium ${highlight ? 'text-blue-200' : 'text-slate-400'}`}>{detail}</p>
    </div>
);

export default StrategyDashboard;