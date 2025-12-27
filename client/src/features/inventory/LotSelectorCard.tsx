export const LotSelectorCard = ({ lot, cmp, isSelected, onToggle }) => {
  const cost = lot.buy_price * lot.quantity;
  const currentVal = cmp * lot.quantity;
  const pnlPct = ((currentVal - cost) / cost) * 100;

  return (
    <div 
      onClick={onToggle}
      className={`cursor-pointer border-2 border-black p-4 flex justify-between items-center transition-all ${isSelected ? 'bg-yellow-50 translate-x-1 shadow-none' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-6 h-6 border-2 border-black flex items-center justify-center ${isSelected ? 'bg-black' : 'bg-white'}`}>
          {isSelected && <span className="text-white text-xs">✓</span>}
        </div>
        <div>
          <p className="font-black text-lg">₹{cost.toFixed(0)}</p>
          <p className="text-[10px] uppercase font-bold text-gray-500">{new Date(lot.buy_date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="text-right">
        <p className={`text-xl font-black ${pnlPct >= 3 ? 'text-green-600' : pnlPct > 0 ? 'text-black' : 'text-red-600'}`}>
          {pnlPct.toFixed(2)}%
        </p>
        <p className="text-[10px] uppercase font-bold text-gray-400">Individual P&L</p>
      </div>
    </div>
  );
};