import React from 'react';

interface LotProps {
  lot: {
    id: number;
    buy_price: number;
    quantity: number;
    buy_date: string;
  }
}

export const LotSelectorCard = ({ lot }: LotProps) => {
  const costBasis = (lot.buy_price * lot.quantity).toFixed(2);

  return (
    <div className="group bg-white border-2 border-black p-4 flex justify-between items-center hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-6">
        <input 
          type="checkbox" 
          className="w-6 h-6 border-4 border-black cursor-pointer accent-black"
        />
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Buy Date</p>
          <p className="font-bold">{new Date(lot.buy_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Qty @ Price</p>
        <p className="font-bold">{lot.quantity} <span className="text-gray-400">@</span> ₹{lot.buy_price}</p>
      </div>

      <div className="text-right">
        <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Lot Value</p>
        <p className="text-xl font-black">₹{costBasis}</p>
      </div>
    </div>
  );
};