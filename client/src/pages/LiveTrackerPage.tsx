import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnalyticsHeatmap } from '../features/live/AnalyticsHeatmap';
import { TickerGrid } from '../features/live/TickerGrid';
import { fetchMarketQuotes } from '../store/slices/stocksSlice';
import { calculatePortfolioAnalytics } from '../utils/portfolioAnalytics';
import { PortfolioHealth } from '../features/live/PortfolioHealth';

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
      <PortfolioHealth analytics={analytics} />
      <AnalyticsHeatmap data={analytics} />
      <TickerGrid data={analytics} />
    </div>
  );
};