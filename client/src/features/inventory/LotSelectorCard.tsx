import React from 'react';
import { uiTheme } from '../../theme/uiTheme';

// Helper to handle DD/MM/YYYY format
const parseDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`);
};

interface LotProps {
  lot: {
    transaction_id: string; // Matches your JSON
    date: string;           // Matches your JSON
    quantity: number;  // Matches your JSON
    price: number;      // Matches your JSON
  };
  cmp: number;
  isSelected: boolean;
  onToggle: () => void;
}

export const LotSelectorCard = ({ lot, cmp, isSelected, onToggle }: LotProps) => {
  // 1. Calculate using the correct property names
  const cost = lot.price * lot.quantity;
  const currentVal = cmp * lot.quantity;
  const isPositive = currentVal - cost >= 0;
  const profitValue = currentVal - cost;
  
  // 2. Prevent division by zero if cmp isn't loaded yet
  const pnlPct = cmp > 0 ? ((currentVal - cost) / cost) * 100 : 0;

  
  // 3. Format Date correctly
  const formattedDate = parseDate(lot.date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div key={lot.transaction_id} className={uiTheme.inventory.card}>
              <div className={uiTheme.inventory.cardHeader}>
                <div>
                  <span className="text-xs font-bold text-gray-500">{lot.date}</span>
                </div>
                {/* CHECKBOX FIX */}
                <input 
                  type="checkbox" 
                  className={uiTheme.inventory.checkbox}
                  checked={isSelected}
                  onChange={() => onToggle()}
                />
              </div>

              <div className={uiTheme.inventory.statRow}>
                <span>Qty: {lot.quantity}</span>
                <span>Avg: ₹{lot.price}</span>
              </div>

              <div className={uiTheme.inventory.statRow}>
                <span>Investment Amount:</span>
                <span className="font-black">₹{lot.price * lot.quantity}</span>
              </div>

              <div className="mt-2 pt-2 border-t-2 border-dashed border-black flex justify-between items-end">
                <span className="text-xs font-black uppercase">P&L</span>
                <div className="text-right">
                  {/* DUAL PROFIT DISPLAY */}
                  <div className={isPositive ? uiTheme.inventory.profitPositive : uiTheme.inventory.profitNegative}>
                    {isPositive ? '+' : ''}₹{profitValue.toLocaleString()}
                  </div>
                  <div className={`text-xs font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    ({pnlPct.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
  );
};