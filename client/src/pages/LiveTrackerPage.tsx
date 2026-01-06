import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnalyticsHeatmap } from '../features/live/AnalyticsHeatmap';
import { TickerGrid } from '../features/live/TickerGrid';
import { fetchMarketQuotes } from '../store/slices/stocksSlice';
import { calculatePortfolioAnalytics } from '../utils/portfolioAnalytics';

// DUMMY DATA FOR TESTING
const DUMMY_ANALYTICS = [
  { name: "FMCGIETF", totalCost: 65000, totalQty: 1100, currentPrice: 56.8, size: 62000, roi: -3.5, wap: 59.0, dayChangePct: 1.2 },
  { name: "GOLDBEES", totalCost: 15000, totalQty: 135, currentPrice: 111.8, size: 15100, roi: 0.6, wap: 111.1, dayChangePct: -0.5 },
  { name: "NIFTYQLITY", totalCost: 18000, totalQty: 800, currentPrice: 22.2, size: 17800, roi: -1.1, wap: 22.5, dayChangePct: 0.8 }
];

export const LiveTrackerPage = () => {
  // Toggle this to switch between Dummy and Actual data once layout is confirmed
  const dispatch = useDispatch();
// Select data from global state
  const rawLots = useSelector((state) => state.trades.openTrades);
  const { liveData, loading } = useSelector((state) => state.stocks);

  // Compute analytics using our common utility
  const analytics = useMemo(
    () => calculatePortfolioAnalytics(rawLots, liveData),
    [rawLots, liveData]
  );

  // Orchestrate the fetch
  useEffect(() => {
    if (rawLots.length > 0) {
      const tickerList = rawLots.map(l => l.ticker);
      dispatch(fetchMarketQuotes(tickerList));
      
      const interval = setInterval(() => {
        dispatch(fetchMarketQuotes(tickerList));
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [rawLots, dispatch]);

return (
    <div className="p-8 space-y-8">
      {loading && <div className="animate-pulse font-black">REFRESHING PRICES...</div>}
      <AnalyticsHeatmap data={analytics} />
      <TickerGrid data={analytics} />
    </div>
  );
};