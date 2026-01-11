import React, { useEffect, useState } from 'react';
import { uiTheme } from '../theme/uiTheme';
import { formatDate } from '../utils';

export const LotExplorer = () => {
  const [lots, setLots] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [filterTicker, setFilterTicker] = useState('');
  const [sortBy, setSortBy] = useState('pnl'); // 'pnl', 'days', 'ticker'

  useEffect(() => {
    fetchOpenLots();
  }, []);

  const fetchOpenLots = async () => {
    const res = await fetch('/api/transactions/open-lots');
    const data = await res.json();
    setLots(data);
    // After getting lots, fetch live quotes for these tickers
    const tickers = [...new Set(data.map(l => l.ticker))];
    fetchLiveQuotes(tickers);
  };

  const fetchLiveQuotes = async (tickers) => {
    const res = await fetch(`/api/zerodha/quotes?tickers=${tickers.join(',')}`);
    const data = await res.json();
    setQuotes(data);
  };

  const getDaysHeld = (date) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getDurationColor = (days) => {
    if (days < 5) return 'bg-cyan-200';
    if (days < 15) return 'bg-orange-200';
    return 'bg-purple-300'; // Stale lot
  };

  const filteredLots = lots
    .filter(l => l.ticker.toLowerCase().includes(filterTicker.toLowerCase()))
    .map(l => {
        const ltp = quotes[l.ticker]?.last_price || l.price;
        const pnl = (ltp - l.price) * l.quantity;
        const pnlPct = ((ltp - l.price) / l.price) * 100;
        const days = getDaysHeld(l.date);
        return { ...l, ltp, pnl, pnlPct, days };
    })
    .sort((a, b) => {
        if (sortBy === 'pnl') return b.pnlPct - a.pnlPct;
        if (sortBy === 'days') return b.days - a.days;
        return a.ticker.localeCompare(b.ticker);
    });

  return (
    <div className={uiTheme.layout.container}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className={uiTheme.text.h1}>Hub Explorer</h1>
        
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            placeholder="Filter Ticker..." 
            className={uiTheme.form.input + " max-w-[200px]"}
            onChange={(e) => setFilterTicker(e.target.value)}
          />
          <select 
            className={uiTheme.form.input + " max-w-[150px]"}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="pnl">Sort by P&L %</option>
            <option value="days">Sort by Days Held</option>
            <option value="ticker">Sort by Ticker</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredLots.map((lot) => (
          <div key={lot.transaction_id} className="relative group">
            {/* The Main Card Body */}
            <div className={`border-4 border-black p-4 h-full flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 bg-white`}>
              
              {/* Top Row: Ticker and Days Held Bubble */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                  {lot.ticker}
                </h3>
                <div className={`px-2 py-1 border-2 border-black font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${getDurationColor(lot.days)}`}>
                  {lot.days} Days
                </div>
              </div>

              {/* Middle Row: Price Data */}
              <div className="flex flex-col mb-4">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Avg: ₹{lot.price} | Qty: {lot.quantity}</span>
                <span className="text-lg font-black leading-none">LTP: ₹{lot.ltp}</span>
              </div>

              {/* Bottom Row: Profit Visualization */}
              <div className={`mt-auto p-2 border-t-4 border-black -mx-4 -mb-4 flex justify-between items-center ${lot.pnl >= 0 ? 'bg-green-400' : 'bg-red-400'}`}>
                <span className="font-black text-sm">₹{lot.pnl.toFixed(2)}</span>
                <span className="font-black text-lg italic">{lot.pnlPct.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};