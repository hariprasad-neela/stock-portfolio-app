import { uiTheme } from '../../theme/uiTheme';

export const InventorySummary = ({ ticker, lots }) => {
  if (!lots || lots.length === 0) return null;

  // 1. Calculate Aggregates
  const totalQty = lots.reduce((sum, lot) => sum + Number(lot.quantity), 0);
  const totalCost = lots.reduce((sum, lot) => sum + (Number(lot.quantity) * Number(lot.price)), 0);
  const weightedAvg = totalCost / totalQty;
  
  // 2. Use CMP from the first lot (assuming all lots for same ticker have same CMP)
  const currentPrice = lots[0].cmp || 0;
  const currentTotalValue = totalQty * currentPrice;
  const totalPnL = currentTotalValue - totalCost;
  const totalPnLPercent = ((currentPrice - weightedAvg) / weightedAvg) * 100;

  const isPositive = totalPnL >= 0;

  return (
    <div className={`${uiTheme.layout.section} bg-black text-white border-yellow-400`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-yellow-400 font-black text-xs uppercase tracking-[0.2em] mb-1">
            Active Position: {ticker}
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black italic">₹{weightedAvg.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            <span className="text-gray-400 font-bold text-sm uppercase">Weighted Avg</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-8">
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase">Total Qty</p>
            <p className="text-lg font-black">{totalQty}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase">Current Value</p>
            <p className="text-lg font-black">₹{currentTotalValue.toLocaleString()}</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="text-[10px] text-gray-500 font-black uppercase">Total P&L</p>
            <p className={`text-lg font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}₹{totalPnL.toLocaleString()} 
              <span className="text-xs ml-1">({totalPnLPercent.toFixed(2)}%)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};