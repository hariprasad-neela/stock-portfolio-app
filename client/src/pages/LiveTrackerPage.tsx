import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnalyticsHeatmap } from '../features/live/AnalyticsHeatmap';
import { PortfolioSummary } from '../features/live/PortfolioSummary';
import { TickerGrid } from '../features/live/TickerGrid';

// DUMMY DATA FOR TESTING
const DUMMY_ANALYTICS = [
  { name: "FMCGIETF", totalCost: 65000, totalQty: 1100, currentPrice: 56.8, size: 62000, roi: -3.5, wap: 59.0, dayChangePct: 1.2 },
  { name: "GOLDBEES", totalCost: 15000, totalQty: 135, currentPrice: 111.8, size: 15100, roi: 0.6, wap: 111.1, dayChangePct: -0.5 },
  { name: "NIFTYQLITY", totalCost: 18000, totalQty: 800, currentPrice: 22.2, size: 17800, roi: -1.1, wap: 22.5, dayChangePct: 0.8 }
];

export const LiveTrackerPage = () => {
  // Toggle this to switch between Dummy and Actual data once layout is confirmed
  const dispatch = useDispatch();
  const rawLots = useSelector((state) => state.trades.openTrades);
  const liveData = useSelector((state) => state.stocks.quotes);
  const [useDummy, setUseDummy] = useState(false); // Default to Live now


  const analytics = useMemo(() => {
    // 1. Check if rawLots exist. If not, return empty array [cite: 2025-12-24].
    if (!rawLots || rawLots.length === 0) return [];

    const groups: Record<string, any> = {};

    // 2. IMPORTANT: Use an empty object fallback for liveData to prevent the "undefined" error.
    const quotes = liveData || {};

    rawLots.forEach(lot => {
      const ticker = lot.ticker;
      // 3. Look up the specific quote, falling back to an empty object if not found.
      const quote = quotes[`NSE:${ticker}`] || {};

      const ltp = Number(quote.last_price) || Number(lot.price) || 0;
      const qty = Number(lot.quantity) || 0;
      const cost = Number(lot.price) || 0;

      if (!groups[ticker]) {
        groups[ticker] = {
          name: ticker,
          totalCost: 0,
          totalQty: 0,
          currentPrice: ltp,
          dayChangePct: Number(quote.pChange) || 0
        };
      }

      groups[ticker].totalCost += (cost * qty);
      groups[ticker].totalQty += qty;
      groups[ticker].currentPrice = ltp;
    });

    return Object.values(groups).map((g: any) => {
      const marketValue = g.currentPrice * g.totalQty;
      const avgCost = g.totalCost / g.totalQty;
      const roi = g.totalCost > 0 ? ((marketValue - g.totalCost) / g.totalCost) * 100 : 0;

      return {
        ...g,
        size: marketValue || 1,
        roi: isNaN(roi) ? 0 : roi,
        wap: avgCost
      };
    });
  }, [rawLots, liveData]);

  // The mapping logic above goes here...
  const data = useDummy ? DUMMY_ANALYTICS : analytics;

  return (
    <div className="flex flex-col gap-12 p-8 bg-[#f0f0f0] min-h-screen">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center border-b-8 border-black pb-6">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Live Tracker
          </h1>
          <p className="font-bold text-sm text-gray-500 uppercase">
            {useDummy ? "Viewing Simulated Environment" : "Real-time Portfolio Engine"}
          </p>
        </div>

        <button
          onClick={() => setUseDummy(!useDummy)}
          className="bg-cyan-400 border-4 border-black px-6 py-3 font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        >
          Switch to {useDummy ? "Live" : "Dummy"}
        </button>
      </div>

      {/* Main Sections - Passing the 'data' prop */}
      <AnalyticsHeatmap data={data} />
      <PortfolioSummary data={data} />
      <TickerGrid data={data} />
    </div>
  );
};