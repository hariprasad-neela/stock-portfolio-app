import React from 'react';
import { TrendingUp, TrendingDown, Zap, Target } from 'lucide-react';

export const TickerCard = ({ item }: { item: any }) => {
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