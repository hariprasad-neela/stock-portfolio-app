// client/src/StrategyDashboard.jsx
import { useSelector, useDispatch } from 'react-redux';
import { setTicker, fetchOpenLots, updateMetrics } from '../store/slices/portfolioSlice';
import React, { useEffect } from 'react';
import OpenInventoryTracker from '../OpenInventoryTracker';
import { Link } from 'react-router-dom';

const StrategyDashboard = () => {
    const dispatch = useDispatch();
    const { selectedTicker, openLots, loading, metrics } = useSelector((state) => state.portfolio);
    const { stocksList } = useSelector(state => state.portfolio);

    useEffect(() => {
        dispatch(fetchOpenLots(selectedTicker));
    }, [selectedTicker, dispatch]);

    const handleTickerChange = (ticker) => {
        dispatch(setTicker(ticker));
    };

    useEffect(() => {
        if (selectedTicker) {
            // This one line replaces your entire fetchData function
            dispatch(fetchOpenLots(selectedTicker));
        }
    }, [selectedTicker, dispatch]);

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

    if (loading) return <div className="animate-pulse">Loading holdings...</div>;

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
                    <div className="p-8">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                            Quick Access
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {stocksList.length > 0 ? (
                                stocksList.map((stock) => (
                                    <Link
                                        key={stock.stock_id}
                                        to={`/stock/${stock.ticker}`}
                                        className="flex flex-col items-center p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg hover:border-blue-500 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
                                            <span className="text-xs font-black text-slate-600 group-hover:text-blue-600">
                                                {stock.ticker.substring(0, 2)}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 uppercase">
                                            {stock.ticker}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm">No stocks found in database.</p>
                            )}
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