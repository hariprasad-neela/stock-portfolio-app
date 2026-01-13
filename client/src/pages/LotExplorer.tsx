import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOpenTrades } from '../store/slices/tradesSlice';
import { fetchMarketQuotes } from '../store/slices/stocksSlice';
import { uiTheme } from '../theme/uiTheme';

export const LotExplorer = () => {
  const dispatch = useDispatch();

  // Local UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, pnl-desc, ticker

  const { openTrades, status: tradeStatus } = useSelector((state: any) => state.trades);
  const { liveData } = useSelector((state: any) => state.stocks);

  useEffect(() => {
    if (tradeStatus === 'idle') {
      dispatch(fetchOpenTrades() as any);
    }
  }, [tradeStatus, dispatch]);

  useEffect(() => {
    if (openTrades.length > 0) {
      const tickerList = [...new Set(openTrades.map((l: any) => l.ticker))];
      dispatch(fetchMarketQuotes(tickerList) as any);
      const interval = setInterval(() => dispatch(fetchMarketQuotes(tickerList) as any), 60000);
      return () => clearInterval(interval);
    }
  }, [openTrades, dispatch]);

  // 1. Add state for the dropdown
  const [selectedTicker, setSelectedTicker] = useState('');

  // 2. Get unique tickers from your openTrades for the dropdown options
  const availableTickers = useMemo(() => {
    const tickers = openTrades.map((t: any) => t.ticker);
    return [...new Set(tickers)].sort();
  }, [openTrades]);

  // 3. Update the processedLots memo to use the dropdown value
  const processedLots = useMemo(() => {
    let filtered = openTrades;

    // Filter by Dropdown instead of Search Term
    if (selectedTicker) {
      filtered = filtered.filter((trade: any) => trade.ticker === selectedTicker);
    }

    return filtered.map((trade: any) => {
      const tickerKey = `NSE:${trade.ticker}`;
      const tickerData = liveData[tickerKey];
      const ltp = tickerData?.last_price || 0;
      const buyPrice = Number(trade.price);
      const qty = Number(trade.quantity);

      const pnl = ltp > 0 ? (ltp - buyPrice) * qty : 0;
      const pnlPercent = (ltp > 0 && buyPrice > 0) ? ((ltp - buyPrice) / buyPrice) * 100 : 0;

      return { ...trade, ltp, pnl, pnlPercent, buyPrice, qty };
    }).sort((a: any, b: any) => {
      if (sortBy === 'pnl-desc') return b.pnlPercent - a.pnlPercent;
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });
  }, [openTrades, liveData, selectedTicker, sortBy]);

  const calculateDaysHeld = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* FILTER & SORT BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* TICKER SELECTOR DROPDOWN */}
        <div className="relative flex-1">
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="w-full appearance-none border-4 border-black p-4 font-black uppercase bg-white focus:bg-yellow-50 outline-none cursor-pointer transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="">-- ALL TICKERS --</option>
            {availableTickers.map(ticker => (
              <option key={ticker} value={ticker}>{ticker}</option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none font-black text-2xl">
            ▼
          </div>
        </div>

        {/* SORT BY DROPDOWN */}
        <div className="relative w-full md:w-64">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none border-4 border-black p-4 font-black uppercase bg-gray-100 outline-none cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="pnl-desc">Best P&L %</option>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none font-black text-xl">
            ⇅
          </div>
        </div>
      </div>

      {/* CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {processedLots.map((lot: any) => {
          const days = calculateDaysHeld(lot.date);
          const isPositive = lot.pnl >= 0;

          return (
            <div key={lot.transaction_id} className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
              <div className="p-3 border-b-4 border-black flex justify-between items-center bg-white">
                <span className="text-2xl font-black">{lot.ticker}</span>
                <span className={`px-2 py-1 border-2 border-black text-[10px] font-black ${days > 15 ? 'bg-purple-400 text-white' : 'bg-cyan-300'}`}>
                  {days}D HELD
                </span>
              </div>

              <div className="p-4 flex-grow bg-white">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                  <span>BUY: ₹{lot.buyPrice.toFixed(2)}</span>
                  <span>QTY: {lot.qty}</span>
                </div>
                <div className="mt-2 text-center border-2 border-black py-2 bg-gray-50">
                  <span className="text-[9px] block font-black opacity-50 uppercase">Live Price</span>
                  <span className="text-2xl font-black italic">₹{lot.ltp > 0 ? lot.ltp.toFixed(2) : "Fetching..."}</span>
                </div>
              </div>

              <div className={`p-3 border-t-4 border-black flex justify-between items-center ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}>
                <div>
                  <span className="text-[9px] font-black uppercase block leading-tight">Total P&L</span>
                  <span className="text-lg font-black leading-none">₹{lot.pnl.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black italic">{lot.pnlPercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {processedLots.length === 0 && (
        <div className="text-center p-20 border-4 border-dashed border-gray-300 mt-10">
          <p className="text-2xl font-black text-gray-300 uppercase italic">No matching lots found</p>
        </div>
      )}
    </div>
  );
};