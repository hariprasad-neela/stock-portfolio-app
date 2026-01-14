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

  // Add state for the dropdown
  const [selectedTicker, setSelectedTicker] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Defining thresholds based on your strategy (3% Target)
  const TARGET_THRESHOLD = 3.0;
  const NEAR_TARGET_THRESHOLD = 2.0;

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

  // 2. Get unique tickers from your openTrades for the dropdown options
  const availableTickers = useMemo(() => {
    const tickers = openTrades.map((t: any) => t.ticker);
    return [...new Set(tickers)].sort();
  }, [openTrades]);

  // 3. Update the processedLots memo to use the dropdown value
  const processedLots = useMemo(() => {
    // 1. First, map and calculate P&L for everything
    const calculated = openTrades.map((trade: any) => {
      const tickerKey = `NSE:${trade.ticker}`;
      const tickerData = liveData[tickerKey];
      const ltp = tickerData?.last_price || 0;
      const buyPrice = Number(trade.price);
      const qty = Number(trade.quantity);

      const pnl = ltp > 0 ? (ltp - buyPrice) * qty : 0;
      const pnlPercent = (ltp > 0 && buyPrice > 0) ? ((ltp - buyPrice) / buyPrice) * 100 : 0;

      return { ...trade, ltp, pnl, pnlPercent, buyPrice, qty };
    });

    // 2. Apply Ticker Filter
    let filtered = calculated;
    if (selectedTicker) {
      filtered = filtered.filter(t => t.ticker === selectedTicker);
    }

    // 3. Apply Status Filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => {
        if (statusFilter === 'target-met') return t.pnlPercent >= TARGET_THRESHOLD;
        if (statusFilter === 'near-target') return t.pnlPercent >= NEAR_TARGET_THRESHOLD && t.pnlPercent < TARGET_THRESHOLD;
        if (statusFilter === 'loss') return t.pnlPercent < 0;
        return true;
      });
    }

    // 4. Final Sort
    return filtered.sort((a: any, b: any) => {
      if (sortBy === 'pnl-desc') return b.pnlPercent - a.pnlPercent;
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });
  }, [openTrades, liveData, selectedTicker, statusFilter, sortBy]);

  const calculateDaysHeld = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* FILTER & SORT BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* TICKER FILTER */}
        <div className="relative">
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="w-full appearance-none border-4 border-black p-4 font-black uppercase bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer"
          >
            <option value="">-- ALL TICKERS --</option>
            {availableTickers.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-black">▼</div>
        </div>

        {/* STATUS FILTER */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full appearance-none border-4 border-black p-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer ${statusFilter === 'target-met' ? 'bg-green-400' : 'bg-white'
              }`}
          >
            <option value="all">-- ALL STATUS --</option>
            <option value="target-met">🚀 Target Reached (3%+)</option>
            <option value="near-target">🟡 Near Target (2%+)</option>
            <option value="loss">🔴 In Loss</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-black">▼</div>
        </div>

        {/* SORTING */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none border-4 border-black p-4 font-black uppercase bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer"
          >
            <option value="pnl-desc">Best P&L %</option>
            <option value="date-desc">Newest First</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-black">⇅</div>
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