// client/src/OpenInventoryTracker.jsx
import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { openModal } from './store/slices/uiSlice';

const OpenInventoryTracker = ({ ticker, openLots, onSellTriggered }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPrice, setCurrentPrice] = useState('');
    const [targetPrice, setTargetPrice] = useState(''); // New State

    const dispatch = useDispatch();

    // --- Selection Logic ---
    const isAllSelected = openLots.length > 0 && selectedIds.length === openLots.length;

    const handleSelectAll = () => {
        setSelectedIds(isAllSelected ? [] : openLots.map(lot => lot.transaction_id));
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // --- Advanced Projection Logic ---
    const summary = useMemo(() => {
        if (selectedIds.length === 0) return null;

        const selectedLotsData = openLots.filter(lot => selectedIds.includes(lot.transaction_id));
        const totalQty = selectedLotsData.reduce((sum, lot) => sum + parseFloat(lot.open_quantity), 0);
        const totalInvestment = selectedLotsData.reduce((sum, lot) => 
            sum + (parseFloat(lot.open_quantity) * parseFloat(lot.buy_price)), 0);
        const avgBuyPrice = totalInvestment / totalQty;

        // Current Calculations
        const cPrice = parseFloat(currentPrice) || 0;
        const currentVal = totalQty * cPrice;
        const currentPL = currentVal - totalInvestment;

        // Target Calculations
        const tPrice = parseFloat(targetPrice) || 0;
        const targetVal = totalQty * tPrice;
        const targetPL = targetVal - totalInvestment;

        return { 
            totalQty, 
            avgBuyPrice, 
            totalInvestment,
            current: { val: currentVal, pl: currentPL, pct: (currentPL/totalInvestment)*100, exists: !!currentPrice },
            target: { val: targetVal, pl: targetPL, pct: (targetPL/totalInvestment)*100, exists: !!targetPrice }
        };
    }, [selectedIds, openLots, currentPrice, targetPrice]);

    return (
        <div className="w-full bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-xl">
            {/* Dual Price Control Header */}
            <div className="px-6 py-6 bg-slate-50/80 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Live Market Price</label>
                    <span className="absolute left-4 bottom-3 text-slate-400 font-bold text-sm">₹</span>
                    <input 
                        type="number"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="Current Price"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest ml-1 mb-1 block">Exit Target Price</label>
                    <span className="absolute left-4 bottom-3 text-blue-400 font-bold text-sm">₹</span>
                    <input 
                        type="number"
                        className="w-full pl-10 pr-4 py-3 bg-blue-50/30 border border-blue-100 rounded-2xl text-sm font-black text-blue-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-blue-200"
                        placeholder="Set Target"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Section (Condensed) */}
            <div className="w-full overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 w-12 text-center"><input type="checkbox" className="w-5 h-5 rounded-lg" onChange={handleSelectAll} checked={isAllSelected} /></th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Qty</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Cost Basis</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {openLots.map((lot) => (
                            <tr key={lot.transaction_id} className={selectedIds.includes(lot.transaction_id) ? 'bg-blue-50/30' : ''}>
                                <td className="px-6 py-3 text-center">
                                    <input type="checkbox" className="w-5 h-5 rounded-lg" checked={selectedIds.includes(lot.transaction_id)} onChange={() => toggleSelect(lot.transaction_id)} />
                                </td>
                                <td className="px-6 py-3 text-xs font-bold text-slate-500">{lot.date}</td>
                                <td className="px-6 py-3 text-sm font-black text-slate-800 text-center">{lot.open_quantity}</td>
                                <td className="px-6 py-3 text-sm font-mono text-right text-slate-400">₹{parseFloat(lot.buy_price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* INTEGRATED SUMMARY & PROJECTION PANEL */}
            {summary && (
                <div className="p-6 bg-slate-900 text-white rounded-t-[2rem]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-white/10">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase">Invested</p>
                            <p className="text-lg font-bold text-white">₹{summary.totalInvestment.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase">Break-even</p>
                            <p className="text-lg font-bold text-blue-400">₹{summary.avgBuyPrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <p className="text-[10px] font-black text-emerald-400 uppercase">Unrealized P&L</p>
                            <p className={`text-lg font-black ${summary.current.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {summary.current.exists ? `₹${summary.current.pl.toLocaleString()}` : '--'}
                            </p>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                            <p className="text-[10px] font-black text-blue-300 uppercase">At Target Profit</p>
                            <p className={`text-lg font-black ${summary.target.pl >= 0 ? 'text-blue-300' : 'text-rose-300'}`}>
                                {summary.target.exists ? `₹${summary.target.pl.toLocaleString()}` : '--'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-6 gap-6">
                        <div className="flex gap-8">
                            <div className="text-center md:text-left">
                                <p className="text-[9px] font-black text-slate-500 uppercase">Selected</p>
                                <p className="text-xl font-black">{summary.totalQty} Units</p>
                            </div>
                            {summary.target.exists && (
                                <div className="text-center md:text-left">
                                    <p className="text-[9px] font-black text-blue-400 uppercase">Target Upside</p>
                                    <p className="text-xl font-black text-blue-400">+{summary.target.pct.toFixed(1)}%</p>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => onSellTriggered({ ticker, selectedBuyIds: selectedIds, quantity: summary.totalQty })}
                            disabled={!summary.current.exists}
                            className={`w-full md:w-auto px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                summary.current.exists 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/40' 
                                : 'bg-slate-800 text-slate-600'
                            }`}
                        >
                            Sell @ Market (₹{parseFloat(currentPrice || 0).toFixed(2)})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpenInventoryTracker;