import React from 'react';

// Helper to handle DD/MM/YYYY format
const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`);
};

interface LotProps {
  lot: {
    transaction_id: string; // Matches your JSON
    date: string;           // Matches your JSON
    open_quantity: number;  // Matches your JSON
    buy_price: number;      // Matches your JSON
  };
  cmp: number;
  isSelected: boolean;
  onToggle: () => void;
}

export const LotSelectorCard = ({ lot, cmp, isSelected, onToggle }: LotProps) => {
  // 1. Calculate using the correct property names
  const cost = lot.buy_price * lot.open_quantity;
  const currentVal = cmp * lot.open_quantity;
  
  // 2. Prevent division by zero if cmp isn't loaded yet
  const pnlPct = cmp > 0 ? ((currentVal - cost) / cost) * 100 : 0;
  
  // 3. Format Date correctly
  const formattedDate = parseDate(lot.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div 
      onClick={onToggle}
      className={`cursor-pointer border-2 border-black p-4 flex justify-between items-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
        isSelected ? 'bg-yellow-50 border-yellow-500' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${isSelected ? 'bg-black' : 'bg-white'}`}>
          {isSelected && <span className="text-white text-xs">✓</span>}
        </div>
        <div>
          <p className="font-black text-lg">₹{cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-[10px] uppercase font-bold text-gray-400">{formattedDate}</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] uppercase font-bold text-gray-400">Qty @ Buy</p>
        <p className="font-bold">{lot.open_quantity} @ ₹{lot.buy_price}</p>
      </div>

      <div className="text-right">
        <p className={`text-xl font-black ${pnlPct >= 3 ? 'text-green-600' : pnlPct < 0 ? 'text-red-600' : 'text-black'}`}>
          {cmp > 0 ? `${pnlPct.toFixed(2)}%` : '---'}
        </p>
        <p className="text-[10px] uppercase font-bold text-gray-400">Current P&L</p>
      </div>
    </div>
  );
};