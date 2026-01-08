import React from 'react';
import { uiTheme } from '../../theme/uiTheme';

const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`);
};

export const LotSelectorCard = ({ lot, cmp, isSelected, onToggle }: LotProps) => {
  const buyPrice = Number(lot.price);
  const qty = Number(lot.quantity);
  const cost = buyPrice * qty;
  const currentVal = cmp * qty;
  const profitValue = currentVal - cost;
  const isPositive = profitValue >= 0;
  const pnlPct = cost > 0 ? (profitValue / cost) * 100 : 0;

  // Swing Logic: Calculate price needed for 3% profit
  const targetPrice = buyPrice * 1.03;
  const distanceToTarget = targetPrice - cmp;
  const isTargetMet = pnlPct >= 3.0;

  // Age for context only
  const acquisitionDate = parseDate(lot.date);
  const daysHeld = Math.floor((new Date().getTime() - acquisitionDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div 
      onClick={onToggle}
      className={`${uiTheme.inventory.card} cursor-pointer transition-all active:scale-[0.98] p-3 ${
        isSelected ? 'bg-yellow-200 ring-4 ring-black shadow-none translate-x-1' : 'bg-white'
      }`}
    >
      {/* Top Info Row: Date and Days Held */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black uppercase italic bg-black text-white px-1.5">
          {lot.date}
        </span>
        <span className="text-[10px] font-black uppercase text-gray-500">
          Age: {daysHeld}d
        </span>
      </div>

      {/* Main Data Grid: Tightened Padding */}
      <div className="grid grid-cols-2 gap-2 border-b-2 border-black border-dotted pb-2 mb-2">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-gray-400">Quantity</span>
          <span className="text-sm font-black italic">{qty} @ ₹{buyPrice.toLocaleString()}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[8px] font-black uppercase text-gray-400 text-green-600">3% Target</span>
          <span className="text-sm font-black text-green-600 underline decoration-2">
            ₹{targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Target Progress Bar: Visual Swing Indicator */}
      {!isTargetMet && (
        <div className="w-full h-3 bg-gray-200 border border-black mb-3 overflow-hidden">
          <div 
            className="h-full bg-cyan-400 border-r border-black" 
            style={{ width: `${Math.max(0, Math.min(100, (pnlPct / 3) * 100))}%` }}
          />
        </div>
      )}

      {/* P&L Zone: Reduced padding, high information density */}
      <div className={`p-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center ${isTargetMet ? 'bg-green-400' : isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase">
            {isTargetMet ? '🎯 TARGET HIT' : 'CURRENT P&L'}
          </span>
          <span className={`text-lg font-black leading-tight ${isPositive ? 'text-green-800' : 'text-red-800'}`}>
            {isPositive ? '+' : ''}₹{Math.abs(profitValue).toLocaleString()}
          </span>
        </div>
        
        <div className="text-right">
          <div className={`text-xl font-black italic tracking-tighter ${isPositive ? 'text-green-800' : 'text-red-800'}`}>
            {pnlPct.toFixed(2)}%
          </div>
          {!isTargetMet && (
            <div className="text-[8px] font-black uppercase text-gray-500">
              Gap: ₹{distanceToTarget.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};