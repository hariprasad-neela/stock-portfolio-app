import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnalyticsHeatmap } from '../features/live/AnalyticsHeatmap';
import { PortfolioSummary } from '../features/live/PortfolioSummary';
import { TickerGrid } from '../features/live/TickerGrid';
import { fetchQuotes } from '../store/slices/stocksSlice';

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
  const [useDummy, setUseDummy] = useState(false); // Default to Live now
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    const getQuotes = async () => {
      // 1. Guard against empty data
      if (!rawLots || rawLots.length === 0) return;

      // 2. Derive symbols inside the effect so it's not a dependency
      const symbols = [...new Set(rawLots.map(lot => `NSE:${lot.ticker}`))].join(',');
      const url = `https://stock-portfolio-api-f38f.onrender.com/api/market/quotes?symbols=${symbols}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        setLiveData(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    getQuotes();

    // 3. Keep the dependency array simple and constant in size
  }, [rawLots]); // Only re-run when the list of trades changes

  const analytics = useMemo(() => {
    if (!rawLots || rawLots.length === 0) return [];

    // FIX: Access the nested 'data' property from the Kite response
    const quotes = liveData || {};
    const groups: Record<string, any> = {};

    rawLots.forEach(lot => {
      const ticker = lot.ticker;
      const instrumentKey = `NSE:${ticker}`;
      const quote = quotes[instrumentKey] || {};

      const ltp = Number(quote.last_price) || 0;
      const lotPrice = Number(lot.price) || 0;
      const qty = Number(lot.quantity) || 0;

      // Calculate Day Change % using (LTP - Previous Close) / Previous Close
      const prevClose = Number(quote.ohlc?.close) || 0;
      const dayChange = prevClose > 0 ? ((ltp - prevClose) / prevClose) * 100 : 0;

      if (!groups[ticker]) {
        groups[ticker] = {
          name: ticker,
          totalCost: 0,
          totalQty: 0,
          lowestBuyPrice: lotPrice,
          latestBuyPrice: lotPrice,
          currentPrice: ltp,
          dayChangePct: dayChange,
          lots: []
        };
      }

      // Calculate this specific lot's performance
      const lot_quote = liveData?.[`NSE:${ticker}`] || {};
      const lot_ltp = Number(quote.last_price) || 0;
      const lot_lotPrice = Number(lot.price) || 0;
      const lot_lotRoi = lotPrice > 0 ? ((ltp - lotPrice) / lotPrice) * 100 : 0;

      groups[ticker].lots.push({
        price: lot_lotPrice,
        qty: lot.quantity,
        roi: lot_lotRoi,
        date: lot.date,
        ltp: lot_ltp
      });

      groups[ticker].totalCost += (lotPrice * qty);
      groups[ticker].totalQty += qty;
      groups[ticker].currentPrice = ltp;

      if (lotPrice < groups[ticker].lowestBuyPrice) groups[ticker].lowestBuyPrice = lotPrice;
      groups[ticker].latestBuyPrice = lotPrice; // Assumes lots are processed in order
    });

    return Object.values(groups).map((g: any) => {
      const marketValue = g.currentPrice * g.totalQty;
      const wap = g.totalCost / g.totalQty;

      return {
        ...g,
        size: marketValue || 1,
        roi: g.totalCost > 0 ? ((marketValue - g.totalCost) / g.totalCost) * 100 : 0,
        wap: wap,
        vsWap: wap > 0 ? ((g.currentPrice - wap) / wap) * 100 : 0,
        vsLowest: g.lowestBuyPrice > 0 ? ((g.currentPrice - g.lowestBuyPrice) / g.lowestBuyPrice) * 100 : 0,
        vsLatest: g.latestBuyPrice > 0 ? ((g.currentPrice - g.latestBuyPrice) / g.latestBuyPrice) * 100 : 0
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