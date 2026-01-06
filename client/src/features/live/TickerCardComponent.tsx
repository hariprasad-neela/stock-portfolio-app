import React from 'react';
import { TrendingUp, TrendingDown, Zap, Target } from 'lucide-react';

const LotHeatmap = ({ lots }: { lots: any[] }) => {
    const getLotColor = (roi: number) => {
        if (roi > 10) return 'bg-green-600';
        if (roi > 0) return 'bg-green-400';
        if (roi > -5) return 'bg-red-300';
        return 'bg-red-600';
    };

    return (
        <div className="mt-4 border-t-2 border-black pt-3">
            <p className="text-[10px] font-black uppercase mb-2 italic">Lot breakdown</p>
            <div className="flex flex-wrap gap-2">
                {lots.map((lot, index) => {
                    const profitAmount = (lot.qty * (lot.ltp - lot.price)).toFixed(2);
                    const isProfit = lot.roi >= 0;

                    return (
                        <div key={index} className="group relative">
                            {/* Individual Lot Square */}
                            <div
                                className={`w-6 h-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-help ${getLotColor(lot.roi)}`}
                            />

                            {/* Neobrutalist Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-32 border-2 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center pointer-events-none">
                                <p className="text-[9px] font-black uppercase text-gray-500">Lot {index + 1}</p>
                                <p className="text-xs font-black">₹{lot.price.toLocaleString()}</p>
                                <div className={`mt-1 text-[10px] font-black py-0.5 border-t border-black ${isProfit ? 'bg-green-200' : 'bg-red-200'}`}>
                                    {isProfit ? '+' : ''}{lot.roi.toFixed(2)}%
                                </div>
                                <p className="text-[9px] font-bold mt-1">
                                    P/L: <span className={isProfit ? 'text-green-700' : 'text-red-700'}>
                                        ₹{profitAmount}
                                    </span>
                                </p>
                                {/* Tooltip Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-black" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const TickerCardComponent = ({ item }: { item: any }) => {
    // Safety checks to prevent crashes if data is missing
    const roi = item.roi ?? 0;
    const isPositive = roi >= 0;
    const size = item.size ?? 0;
    const ltp = item.currentPrice ?? 0;
    const wap = item.wap ?? 0;

    return (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
            {/* Header */}
            <div className={`p-4 border-b-4 border-black flex justify-between items-center ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}>
                <h3 className="text-xl font-black uppercase tracking-tighter">{item.name}</h3>
                <div className="flex items-center gap-1 bg-white border-2 border-black px-2 py-0.5">
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="font-black text-sm">{roi.toFixed(2)}%</span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4 flex-grow">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase leading-none">Market Value</p>
                        <p className="text-2xl font-black">₹{size.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase leading-none">Quantity</p>
                        <p className="font-black">{item.totalQty}</p>
                    </div>
                </div>

                {/* Pricing Matrix */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="border-2 border-black p-2 bg-slate-50">
                        <p className="text-[9px] font-black uppercase text-gray-400">Avg. Cost (WAP)</p>
                        <p className="font-bold">₹{wap.toFixed(2)}</p>
                    </div>
                    <div className="border-2 border-black p-2 bg-slate-50">
                        <p className="text-[9px] font-black uppercase text-gray-400">Current (LTP)</p>
                        <p className="font-bold">₹{ltp.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t-2 border-black border-dashed">
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-gray-400">vs WAP</p>
                    <p className="text-[10px] font-bold">₹{item.wap.toFixed(1)}</p>
                    <p className={`text-xs font-black ${item.vsWap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.vsWap >= 0 ? '+' : ''}{item.vsWap.toFixed(2)}%
                    </p>
                </div>
                <div className="text-center border-x-2 border-black border-dotted">
                    <p className="text-[8px] font-black uppercase text-gray-400">vs Lowest</p>
                    <p className="text-[10px] font-bold">₹{item.lowestBuyPrice.toFixed(1)}</p>
                    <p className={`text-xs font-black ${item.vsLowest >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.vsLowest >= 0 ? '+' : ''}{item.vsLowest.toFixed(2)}%
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-gray-400">vs Latest</p>
                    <p className="text-[10px] font-bold">₹{item.latestBuyPrice.toFixed(1)}</p>
                    <p className={`text-xs font-black ${item.vsLatest >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.vsLatest >= 0 ? '+' : ''}{item.vsLatest.toFixed(2)}%
                    </p>
                </div>
            </div>
            <div className="p-4"><LotHeatmap lots={item.lots} /></div>

            {/* Footer Actions */}
            <div className="p-4 border-t-4 border-black bg-yellow-400 flex justify-between">
                <button className="flex items-center gap-2 font-black text-xs uppercase hover:underline">
                    <Zap size={14} /> Buy More
                </button>
                <button className="flex items-center gap-2 font-black text-xs uppercase hover:underline">
                    <Target size={14} /> View Batches
                </button>
            </div>
        </div>
    );
};
