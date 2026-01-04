import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

export const LiveTrackerPage = () => {
  const [rawLots, setRawLots] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Open Transactions first
        const lotsRes = await fetch(`${API_BASE}/api/openTransactions`);
        const lots = await lotsRes.json();
        setRawLots(lots);

        // 2. Extract unique tickers and format them for the API
        // Result: "NSE:FMCGIETF,NSE:GOLDBEES,..."
        if (lots && lots.length > 0) {
          const uniqueSymbols = [...new Set(lots.map((lot: any) => `NSE:${lot.ticker}`))].join(',');

          // 3. Fetch Quotes using the dynamically generated symbols string
          const quotesRes = await fetch(`${API_BASE}/api/market/quotes?symbols=${uniqueSymbols}`);

          if (!quotesRes.ok) {
            throw new Error('Failed to fetch market quotes');
          }

          const priceData = await quotesRes.json();
          setLiveData(priceData);
        }
      } catch (err) {
        console.error("Dashboard Load Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE]); // Only re-run if the API base URL changes

  const analytics = useMemo(() => {
    const groups: Record<string, any> = {};

    rawLots.forEach(lot => {
      const ticker = lot.ticker;
      const quote = liveData[`NSE:${ticker}`] || {};
      const ltp = quote.last_price || parseFloat(lot.price);
      const prevClose = quote.ohlc?.close || ltp;
      const lotPrice = parseFloat(lot.price);
      const lotQty = parseFloat(lot.quantity);

      if (!groups[ticker]) {
        groups[ticker] = {
          ticker,
          totalQty: 0,
          totalCost: 0,
          lowestPrice: lotPrice,
          latestPrice: lotPrice,
          currentPrice: ltp,
          prevClose: prevClose,
          _latestDate: new Date(lot.date)
        };
      }

      const g = groups[ticker];
      g.totalQty += lotQty;
      g.totalCost += (lotQty * lotPrice);
      if (lotPrice < g.lowestPrice) g.lowestPrice = lotPrice;

      if (new Date(lot.date) >= g._latestDate) {
        g.latestPrice = lotPrice;
        g._latestDate = new Date(lot.date);
      }
    });

    return Object.values(groups).map((g: any) => {
      const wap = g.totalCost / g.totalQty;
      return {
        ...g,
        wap,
        dayChangePct: ((g.currentPrice - g.prevClose) / g.prevClose) * 100,
        pnlWap: ((g.currentPrice - wap) / wap) * 100,
        pnlLowest: ((g.currentPrice - g.lowestPrice) / g.lowestPrice) * 100,
        pnlLatest: ((g.currentPrice - g.latestPrice) / g.latestPrice) * 100,
      };
    });
  }, [rawLots, liveData]);

  if (loading) return <div className="p-10 font-black italic">LOADING MARKET DATA...</div>;

  return (
    <div className="p-6 bg-slate-100 min-h-screen space-y-8 font-sans">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-black text-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Portfolio Strategy</p>
          <h1 className="text-2xl font-black italic uppercase">₹5,000 Lot Engine</h1>
        </div>
        <div className="bg-yellow-400 p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <Zap size={32} fill="black" />
          <div>
            <p className="text-[10px] font-black uppercase text-black/60">Live Tickers</p>
            <p className="text-2xl font-black">{analytics.length}</p>
          </div>
        </div>
      </header>

      {/* TICKER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {analytics.map(item => (
          <div key={item.ticker} className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            {/* Ticker & Day Change */}
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-black italic tracking-tighter">{item.ticker}</h2>
              <div className={`text-right px-2 py-1 border-2 border-black ${item.dayChangePct >= 0 ? 'bg-green-400' : 'bg-red-400'}`}>
                <p className="text-[10px] font-black leading-none">DAY</p>
                <p className="text-sm font-black">{item.dayChangePct.toFixed(2)}%</p>
              </div>
            </div>

            {/* Anchor Bar Visualization */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-black text-gray-500">
                <span>LOWEST: ₹{item.lowestPrice.toFixed(1)}</span>
                <span className="text-black">LTP: ₹{item.currentPrice.toFixed(1)}</span>
              </div>
              <div className="relative h-8 bg-slate-100 border-2 border-black overflow-hidden">
                {/* WAP Marker */}
                <AnchorMarker pos={calculatePos(item.wap, item)} color="bg-black" label="WAP" />
                {/* Latest Lot Marker */}
                <AnchorMarker pos={calculatePos(item.latestPrice, item)} color="bg-purple-600" label="LATEST" />
                {/* Current Price Marker */}
                <div
                  className="absolute inset-y-0 w-1 bg-yellow-400 border-x border-black z-10"
                  style={{ left: `${calculatePos(item.currentPrice, item)}%` }}
                />
              </div>
            </div>

            {/* Performance Deltas */}
            <div className="grid grid-cols-3 gap-2">
              <DeltaBox label="vs WAP" val={item.pnlWap} />
              <DeltaBox label="vs LOWEST" val={item.pnlLowest} />
              <DeltaBox label="vs LATEST" val={item.pnlLatest} />
            </div>

            {/* Footer Data */}
            <div className="flex justify-between items-end pt-4 border-t-2 border-black border-dashed mt-auto">
              <div>
                <p className="text-[10px] font-bold text-gray-400">LOTS</p>
                <p className="font-black">{(item.totalCost / 5000).toFixed(1)} Units</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400">MARKET VALUE</p>
                <p className="text-xl font-black">₹{(item.currentPrice * item.totalQty).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper to calculate relative position on the bar
const calculatePos = (val: number, item: any) => {
  const min = item.lowestPrice * 0.95; // 5% padding
  const max = Math.max(item.currentPrice, item.wap, item.latestPrice) * 1.05;
  return ((val - min) / (max - min)) * 100;
};

const AnchorMarker = ({ pos, color, label }: any) => (
  <div className="absolute inset-y-0 flex flex-col items-center" style={{ left: `${pos}%` }}>
    <div className={`w-0.5 h-full ${color}`} />
    <span className={`text-[7px] font-black p-0.5 text-white ${color} mt-auto`}>{label}</span>
  </div>
);

const DeltaBox = ({ label, val }: any) => (
  <div className={`p-2 border-2 border-black ${val >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
    <p className="text-[8px] font-black text-gray-500 uppercase leading-none mb-1">{label}</p>
    <div className="flex items-center gap-1">
      {val >= 0 ? <TrendingUp size={10} className="text-green-600" /> : <TrendingDown size={10} className="text-red-600" />}
      <p className={`text-xs font-black ${val >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {Math.abs(val).toFixed(1)}%
      </p>
    </div>
  </div>
);