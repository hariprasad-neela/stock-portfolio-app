// client/src/OpenInventoryTracker.jsx
import React, { useState, useMemo } from 'react';

const OpenInventoryTracker = ({ ticker, openLots }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [currentPrice, setCurrentPrice] = useState('');

    // Toggle individual selection
    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Calculate Profit/Loss for Selected Lots
    const selectionSummary = useMemo(() => {
        if (selectedIds.length === 0 || !currentPrice) return null;

        const selectedLotsData = openLots.filter(lot => selectedIds.includes(lot.transaction_id));
        const totalQty = selectedLotsData.reduce((sum, lot) => sum + parseFloat(lot.open_quantity), 0);
        const totalCost = selectedLotsData.reduce((sum, lot) => sum + (parseFloat(lot.open_quantity) * parseFloat(lot.buy_price)), 0);
        
        const avgBuyPrice = totalCost / totalQty;
        const marketPrice = parseFloat(currentPrice);
        const profitLoss = (marketPrice - avgBuyPrice) * totalQty;
        const profitPercent = ((marketPrice - avgBuyPrice) / avgBuyPrice) * 100;

        return { totalQty, avgBuyPrice, profitLoss, profitPercent, isProfit: profitLoss >= 0 };
    }, [selectedIds, openLots, currentPrice]);

    if (!openLots || openLots.length === 0) return (
        <div className="p-16 text-center text-slate-400 font-medium italic">No open lots found.</div>
    );

    return (
        <div className="w-full">
            {/* Market Price Input Section */}
            <div className="px-8 py-6 flex flex-col md:flex-row items-center gap-4 bg-white border-b border-slate-50">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Control</div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input 
                        type="number"
                        className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 w-full md:w-48 transition-all"
                        placeholder="Current Price"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value)}
                    />
                </div>
                {!currentPrice && selectedIds.length > 0 && (
                    <span className="text-xs text-amber-500 font-bold animate-pulse italic">
                        ← Enter current price to see profit status
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                    onChange={(e) => setSelectedIds(e.target.checked ? openLots.map(l => l.transaction_id) : [])}
                                    checked={selectedIds.length === openLots.length && openLots.length > 0}
                                />
                            </th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Buy Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {openLots.map((lot) => (
                            <tr key={lot.transaction_id} className={`transition-colors ${selectedIds.includes(lot.transaction_id) ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}`}>
                                <td className="px-6 py-4 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                                        checked={selectedIds.includes(lot.transaction_id)}
                                        onChange={() => toggleSelect(lot.transaction_id)}
                                    />
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">{new Date(lot.date).toLocaleDateString('en-IN')}</td>
                                <td className="px-6 py-4 text-sm font-black text-slate-900 text-center">{lot.open_quantity}</td>
                                <td className="px-6 py-4 text-sm font-mono text-slate-500 font-medium text-center">₹{parseFloat(lot.buy_price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* DYNAMIC PROFIT STATUS MESSAGE */}
            {selectionSummary && (
                <div className={`m-6 p-6 rounded-2xl border-2 transition-all duration-500 animate-in slide-in-from-bottom-4 ${
                    selectionSummary.isProfit ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                }`}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-center md:text-left">
                            <h4 className={`text-lg font-black ${selectionSummary.isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {selectionSummary.isProfit ? 'Profit Detected' : 'Currently in Loss'}
                            </h4>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                                Selected: {selectionSummary.totalQty} Units @ Avg ₹{selectionSummary.avgBuyPrice.toFixed(2)}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className={`text-2xl font-black ${selectionSummary.isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {selectionSummary.isProfit ? '+' : ''}₹{selectionSummary.profitLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                                <p className={`text-xs font-bold ${selectionSummary.isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    ({selectionSummary.profitPercent.toFixed(2)}%)
                                </p>
                            </div>
                            
                            <button className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                                selectionSummary.isProfit 
                                ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' 
                                : 'bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700'
                            }`}>
                                Sell Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpenInventoryTracker;