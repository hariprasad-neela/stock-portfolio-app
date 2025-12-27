import React, { useState, useEffect } from 'react';

interface PortfolioSummary {
  ticker: string;
  total_qty: number;
  avg_price: number;
  total_cost: number;
}

export const LiveTrackerPage = () => {
  const [portfolio, setPortfolio] = useState<PortfolioSummary[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const loadFullPortfolio = async () => {
      try {
        // 1. Get consolidated transactions
        const res = await fetch(`${API_BASE}/api/strategy/consolidated`);
        const data = await res.json();
        setPortfolio(data);

        // 2. Fetch Live Prices for all tickers in the portfolio
        if (data.length > 0) {
          const symbols = data.map((item: any) => `NSE:${item.ticker}`).join(',');
          const priceRes = await fetch(`${API_BASE}/api/market/quotes?symbols=${symbols}`);
          const priceData = await priceRes.json();
          setLivePrices(priceData);
        }
      } catch (err) {
        console.error("Portfolio Load Failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadFullPortfolio();
  }, [API_BASE]);

  const totalPortfolioCost = portfolio.reduce((sum, item) => sum + Number(item.total_cost), 0);
  const totalCurrentValue = portfolio.reduce((sum, item) => {
    const price = livePrices[`NSE:${item.ticker}`] || Number(item.avg_price);
    return sum + (price * Number(item.total_qty));
  }, 0);

  const totalPnL = totalCurrentValue - totalPortfolioCost;
  const totalPnLPct = (totalPnL / totalPortfolioCost) * 100;

  const totalPortfolioCost = portfolio.reduce((sum, item) => sum + parseFloat(item.total_cost.toString()), 0);

  return (
    <div className="space-y-8">
      {/* GLOBAL PORTFOLIO BAR */}
      <section className="bg-black text-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
        <div>
          <p className="text-xs font-black uppercase text-gray-400">Total Invested Value</p>
          <p className="text-4xl font-black">₹{totalPortfolioCost.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase text-gray-400">Current P&L</p>
          <p className={`text-4xl font-black ${totalPnL >= 0 ? 'text-green-400' : 'text-red-500'}`}>
            {totalPnL >= 0 ? '+' : ''}{totalPnLPct.toFixed(2)}%
          </p>
          <p className="font-bold">₹{totalPnL.toLocaleString('en-IN')}</p>
        </div>
      </section>

      {/* TICKER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolio.map((item) => {
          const avgPrice = parseFloat(item.avg_price.toString());
          const totalQty = parseFloat(item.total_qty.toString());
          const ltp = livePrices[`NSE:${item.ticker}`] || 0;
          const pnl = ltp > 0 ? ((ltp - Number(item.avg_price)) / Number(item.avg_price)) * 100 : 0;

          return (
            <div key={item.ticker} className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black uppercase italic">{item.ticker}</h3>
                <div className={`px-2 py-1 font-black text-xs ${pnl >= 3 ? 'bg-green-400' : 'bg-gray-100'}`}>
                  {pnl >= 3 ? 'TARGET MET' : 'HOLDING'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>QTY: {item.total_qty}</span>
                  <span>AVG: ₹{Number(item.avg_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase">Current Price</p>
                    <p className="text-xl font-black">₹{ltp.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${pnl >= 0 ? 'text-black' : 'text-red-600'}`}>
                      {pnl.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
