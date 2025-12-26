// client/src/StrategyDashboard.jsx
import { useSelector, useDispatch } from 'react-redux';
import { setTicker, fetchOpenLots, updateMetrics } from '../store/slices/portfolioSlice';
import React, { useEffect, useState } from 'react';
import OpenInventoryTracker from '../OpenInventoryTracker';
import InventoryTable from '../features/inventory/InventoryTable';
import BatchBuilder from '../features/inventory/BatchBuilder';
import { OpenLot } from '../types';

const StrategyDashboard = () => {
    const dispatch = useDispatch();
    const { selectedTicker, openLots, loading, metrics } = useSelector((state) => state.portfolio);
    const { stocksList } = useSelector(state => state.portfolio);
    // State for selected lots
    const [selectedIds, setSelectedIds] = useState < string[] > ([]);
    // Mock data - in real app, this comes from your Redux store or API
    const [lots, setLots] = useState < OpenLot[] > ([
        { transaction_id: '16e0bcdc-5605-4911-8e6d-298f22729321', date: '24/12/2025', open_quantity: 24, buy_price: 209.13 }
    ]);
    // Handler to toggle selection
    const handleToggle = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };
    // 3. Handler to execute the Strategy
    const handleCreateBatch = async () => {
        if (selectedIds.length === 0) return;

        const batchData = {
            batch_name: `Batch_${new Date().getTime()}`,
            transaction_ids: selectedIds,
            // portfolio_id will come from your global state/context
        };

        try {
            console.log("Executing Selective Batch for:", batchData);

            // TODO: Replace with your actual API call
            // await api.post('/batches', batchData);

            alert(`Success! Created batch with ${selectedIds.length} lots.`);
            setSelectedIds([]); // Clear selection after success
        } catch (error) {
            console.error("Batch creation failed", error);
        }
    };

    useEffect(() => {
        dispatch(fetchOpenLots(selectedTicker));
    }, [selectedTicker, dispatch]);

    const handleTickerChange = (e) => {
        dispatch(setTicker(e.target.value));
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
            <div className="grid grid-cols-12 gap-8">
                {/* Table takes up 9 columns */}
                <div className="col-span-12 lg:col-span-9">
                    <InventoryTable
                        lots={lots}
                        selectedIds={selectedIds}
                        onToggleLot={handleToggle}
                    />
                </div>

                {/* Sidebar takes up 3 columns */}
                <div className="col-span-12 lg:col-span-3">
                    <BatchBuilder
                        selectedLots={lots.filter(l => selectedIds.includes(l.transaction_id))}
                        onClear={() => setSelectedIds([])}
                        onCreateBatch={handleCreateBatch}
                    />
                </div>
            </div>
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
                        <div className="flex items-center gap-4">
                            <label className="font-black uppercase text-xs text-slate-400">Select Asset:</label>
                            <select
                                value={selectedTicker}
                                onChange={handleTickerChange}
                                className="bg-white border-2 border-slate-900 rounded-xl px-4 py-2 font-bold focus:ring-2 ring-blue-500 outline-none"
                            >
                                {stocksList.map(stock => (
                                    <option key={stock.stock_id} value={stock.ticker}>
                                        {stock.ticker}
                                    </option>
                                ))}
                            </select>
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