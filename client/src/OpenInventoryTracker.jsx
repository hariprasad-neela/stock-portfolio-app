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
        <div className="bg-white">
            {/* Action Bar */}
            <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
                <div className="relative w-full md:w-64">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">₹</span>
                    <input
                        type="number"
                        placeholder="Live Market Price"
                        className="w-full pl-7 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value)}
                    />
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                    Showing {openLots.length} Open Lots
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buy Price</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notional P&L</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Running ABP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {calculatedLots.map((lot) => (
                            <tr key={lot.transaction_id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{lot.date}</td>
                                <td className="px-6 py-4 text-sm text-slate-900 font-semibold font-mono">{lot.open_quantity}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 font-mono">₹{lot.buy_price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <div className={`text-sm font-bold font-mono ${lot.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {lot.pnl >= 0 ? '+' : ''}₹{lot.pnl.toFixed(2)}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{lot.pnlPercent.toFixed(2)}%</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-700 font-mono">
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