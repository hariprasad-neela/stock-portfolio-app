// client/src/OpenInventoryTracker.jsx
import React, { useState, useMemo } from 'react';

const OpenInventoryTracker = ({ ticker, openLots, onSellTriggered }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPrice, setCurrentPrice] = useState('');

    // --- Selection Logic ---
    const isAllSelected = openLots.length > 0 && selectedIds.length === openLots.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(openLots.map(lot => lot.transaction_id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // --- Expanded Summary Logic ---
    const summary = useMemo(() => {
        if (selectedIds.length === 0) return null;

        const selectedLotsData = openLots.filter(lot => selectedIds.includes(lot.transaction_id));
        
        const totalQty = selectedLotsData.reduce((sum, lot) => sum + parseFloat(lot.open_quantity), 0);
        const totalInvestment = selectedLotsData.reduce((sum, lot) => 
            sum + (parseFloat(lot.open_quantity) * parseFloat(lot.buy_price)), 0);
        
        const avgBuyPrice = totalInvestment / totalQty;
        const marketPrice = parseFloat(currentPrice) || 0;
        
        const currentMarketValue = totalQty * marketPrice;
        const profitLoss = currentMarketValue - totalInvestment;
        const profitPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

        return { 
            totalQty, 
            avgBuyPrice, 
            totalInvestment, 
            currentMarketValue, 
            profitLoss, 
            profitPercent, 
            isProfit: profitLoss >= 0,
            hasPrice: !!currentPrice 
        };
    }, [selectedIds, openLots, currentPrice]);

    if (!openLots || openLots.length === 0) return (
        <div className="p-16 text-center text-slate-400 font-medium italic">No open lots found for {ticker}.</div>
    );

    return (
        <div className="w-full bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            {/* Header / Price Input */}
            <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight">Open Inventory: {ticker}</h3>
                </div>
                <div className="relative w-full sm:w-64">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">LIVE PRICE: ₹</span>
                    <input 
                        type="number"
                        className="w-full pl-16 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter Current Market Price"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value)}
                    />
                </div>
            </div>

            {/* Responsive Table */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 w-12">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                    onChange={handleSelectAll}
                                    checked={isAllSelected}
                                />
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Entry Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] text-center">Holding Qty</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] text-right">Avg. Buy Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {openLots.map((lot) => (
                            <tr key={lot.transaction_id} className={`transition-colors ${selectedIds.includes(lot.transaction_id) ? 'bg-blue-50/40' : 'hover:bg-slate-50/30'}`}>
                                <td className="px-6 py-4">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 cursor-pointer" 
                                        checked={selectedIds.includes(lot.transaction_id)}
                                        onChange={() => toggleSelect(lot.transaction_id)}
                                    />
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-600">{lot.date}</td>
                                <td className="px-6 py-4 text-sm font-black text-slate-900 text-center">{lot.open_quantity}</td>
                                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-500 text-right">₹{parseFloat(lot.buy_price).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* FULL DATA SUMMARY PANEL */}
            {summary && (
                <div className={`border-t-4 transition-all ${summary.isProfit ? 'border-emerald-500 bg-emerald-50/30' : 'border-rose-500 bg-rose-50/30'} p-6 md:p-8`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Selected</p>
                            <p className="text-xl font-black text-slate-800">{summary.totalQty} <span className="text-xs text-slate-400">Units</span></p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invested Value</p>
                            <p className="text-xl font-black text-slate-800">₹{summary.totalInvestment.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Value</p>
                            <p className="text-xl font-black text-slate-800">
                                {summary.hasPrice ? `₹${summary.currentMarketValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}` : '--'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weighted Avg</p>
                            <p className="text-xl font-black text-slate-800 text-blue-600">₹{summary.avgBuyPrice.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-200/50">
                        {summary.hasPrice ? (
                            <div className="text-center md:text-left">
                                <p className={`text-3xl font-black tracking-tighter ${summary.isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {summary.isProfit ? '+' : ''}₹{summary.profitLoss.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                </p>
                                <p className={`text-sm font-black flex items-center gap-2 justify-center md:justify-start ${summary.isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {summary.isProfit ? '↗' : '↘'} {summary.profitPercent.toFixed(2)}% Unrealized Status
                                </p>
                            </div>
                        ) : (
                            <div className="text-amber-500 text-sm font-bold animate-pulse">
                                ⚠️ Enter market price to calculate potential returns
                            </div>
                        )}

                        <button 
                            onClick={() => onSellTriggered({
                                ticker: ticker,
                                selectedBuyIds: selectedIds,
                                quantity: summary.totalQty
                            })}
                            disabled={!summary.hasPrice}
                            className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 ${
                                !summary.hasPrice 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'
                            }`}
                        >
                            Sell {summary.totalQty} Units Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpenInventoryTracker;