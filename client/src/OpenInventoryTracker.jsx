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

    // client/src/OpenInventoryTracker.jsx (Table Section Update)

    return (
        <div className="w-full overflow-hidden">
            {/* Market Price Input: Stacked on mobile, side-by-side on desktop */}
            <div className="px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center gap-4 bg-white border-b border-slate-50">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Market Price</div>
                <div className="relative w-full sm:w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                        type="number"
                        className="pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 w-full transition-all"
                        placeholder="0.00"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value)}
                    />
                </div>
            </div>

            {/* The Table Wrapper: This is the critical fix for mobile width */}
            <div className="w-full overflow-x-auto scrollbar-hide">
                <table className="w-full text-left min-w-[500px]">
                    {/* min-w-[500px] ensures the table columns don't collapse into illegibility */}
                    <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                            <th className="px-4 md:px-6 py-4 w-12 text-center">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                            </th>
                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                            <th className="px-4 md:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {/* ... your map function ... */}
                    </tbody>
                </table>
            </div>

            {/* Responsive Profit Box */}
            {selectionSummary && (
                <div className={`m-4 md:m-6 p-5 md:p-6 rounded-[1.5rem] border-2 shadow-sm ${selectionSummary.isProfit ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                    }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-center sm:text-left">
                            <p className={`text-xl font-black ${selectionSummary.isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {selectionSummary.isProfit ? 'Profit' : 'Loss'}: ₹{selectionSummary.profitLoss.toLocaleString()}
                            </p>
                            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1">
                                {selectionSummary.totalQty} Units Selected
                            </p>
                        </div>
                        <button className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">
                            Sell Selected
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpenInventoryTracker;