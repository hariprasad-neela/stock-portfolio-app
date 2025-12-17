// client/src/OpenInventoryTracker.jsx
import React, { useState, useMemo } from 'react';

const OpenInventoryTracker = ({ ticker, openLots }) => {
    const [currentPrice, setCurrentPrice] = useState('');
    const [selectedLots, setSelectedLots] = useState([]);

    const calculatedLots = useMemo(() => {
        let cumulativeUnits = 0;
        let cumulativeCost = 0;
        const priceNum = parseFloat(currentPrice) || 0;

        return openLots.map(lot => {
            cumulativeUnits += lot.open_quantity;
            cumulativeCost += (lot.open_quantity * lot.buy_price);
            const runningABP = cumulativeCost / cumulativeUnits;
            const pnl = priceNum > 0 ? (priceNum - lot.buy_price) * lot.open_quantity : 0;
            const pnlPercent = priceNum > 0 ? ((priceNum - lot.buy_price) / lot.buy_price) * 100 : 0;

            return { ...lot, runningABP, pnl, pnlPercent };
        });
    }, [openLots, currentPrice]);

    if (openLots.length === 0) {
        return (
            <div className="p-12 text-center bg-slate-50/50 rounded-b-2xl border-t border-slate-100">
                <div className="text-4xl mb-4">📂</div>
                <h3 className="text-slate-900 font-semibold">No open positions</h3>
                <p className="text-slate-500 text-sm mt-1">Add a buy transaction for {ticker} to see the inventory breakdown.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Market Price Input Section */}
            <div className="px-8 py-6 flex items-center gap-4 bg-white border-b border-slate-50">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pricing Control:</div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                    <input
                        type="number"
                        className="pl-8 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 w-48 transition-all"
                        placeholder="Enter Market Price"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Date</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price Paid</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Running ABP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {calculatedLots.map(lot => (
                            <tr key={lot.transaction_id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5 text-sm font-semibold text-slate-600 uppercase tracking-tighter">{lot.date}</td>
                                <td className="px-8 py-5 text-sm font-black text-slate-900">{lot.open_quantity}</td>
                                <td className="px-8 py-5 text-sm font-medium text-slate-500">₹{lot.buy_price}</td>
                                <td className="px-8 py-5 text-right">
                                    <span className="text-xs font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                                        ₹{lot.runningABP.toFixed(2)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OpenInventoryTracker;