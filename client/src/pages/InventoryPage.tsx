import React, { useState, useEffect } from 'react';
import { LotSelectorCard } from '../features/inventory/LotSelectorCard';

export const InventoryPage = () => {
  const [ticker, setTicker] = useState('');
  const [activeTicker, setActiveTicker] = useState(''); // The ticker we are actually tracking
  const [lots, setLots] = useState([]);
  const [selectedLotIds, setSelectedLotIds] = useState<number[]>([]);
  const [cmp, setCmp] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  const API_BASE = import.meta.env.VITE_API_URL || '';

  // 1. Core function to fetch data
  const fetchData = async (symbol: string) => {
    try {
      // Fetch Lots
      const invRes = await fetch(`${API_BASE}/api/strategy/open-inventory/${symbol.toUpperCase()}`);
      const invData = await invRes.json();
      setLots(invData);

      // Fetch Live Price
      const priceRes = await fetch(`${API_BASE}/api/market/quotes?symbols=NSE:${symbol.toUpperCase()}`);
      const priceData = await priceRes.json();
      setCmp(priceData[`NSE:${symbol.toUpperCase()}`] || 0);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // 2. Trigger fetch when button is clicked
  const handleSearch = () => {
    if (!ticker) return;
    setLoading(true);
    setActiveTicker(ticker.toUpperCase());
    fetchData(ticker).finally(() => setLoading(false));
  };

  // 3. Keep Price Updated (Poll every 30 seconds if ticker is active)
  useEffect(() => {
    if (!activeTicker) return;
    const interval = setInterval(() => fetchData(activeTicker), 30000);
    return () => clearInterval(interval);
  }, [activeTicker]);

  // Calculations
  const selectedLotsData = lots.filter(lot => selectedLotIds.includes(lot.id));
  const totalCost = selectedLotsData.reduce((acc, lot) => acc + (lot.buy_price * lot.quantity), 0);
  const currentVal = selectedLotsData.reduce((acc, lot) => acc + (cmp * lot.quantity), 0);
  const profitAmt = currentVal - totalCost;
  const profitPct = totalCost > 0 ? (profitAmt / totalCost) * 100 : 0;
  const isTargetMet = profitPct >= 3.0;

  return (
    <div className="space-y-8">
      {/* SEARCH SECTION */}
      <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-black uppercase mb-4 italic">Select Asset Ticker</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. SILVERBEES, GOLDBEES, TCS" 
            className="flex-1 border-4 border-black p-4 font-black uppercase focus:bg-yellow-50 outline-none"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="bg-black text-white px-8 py-4 font-black uppercase hover:bg-yellow-400 hover:text-black transition-colors border-2 border-black"
          >
            Load Inventory
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LOTS LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black uppercase text-xl">Available Lots</h3>
            {activeTicker && <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">CMP: ₹{cmp}</span>}
          </div>
          
          {loading ? (
            <div className="p-10 text-center font-black animate-pulse uppercase">Syncing with Zerodha...</div>
          ) : lots.length > 0 ? (
            lots.map(lot => (
              <LotSelectorCard 
                key={lot.transaction_id} 
                lot={lot} 
                cmp={cmp}
                isSelected={selectedLotIds.includes(lot.transaction_id)}
                onToggle={() => {
                  setSelectedLotIds(prev => 
                    prev.includes(lot.transaction_id) ? prev.filter(i => i !== lot.transaction_id) : [...prev, lot.transaction_id]
                  );
                }}
              />
            ))
          ) : (
            <div className="border-2 border-dashed border-gray-400 p-10 text-center text-gray-400 font-bold uppercase">
              No lots found. Search for a ticker to begin.
            </div>
          )}
        </div>

        {/* SIDEBAR SUMMARY */}
        <div className="lg:col-span-1">
          <div className={`sticky top-24 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500 ${isTargetMet ? 'bg-green-400' : 'bg-white'}`}>
            <h3 className="font-black uppercase text-2xl mb-2 italic">Strategy</h3>
            <p className="text-[10px] font-black uppercase mb-4 bg-black text-white inline-block px-2">Exit Threshold: 3.0%</p>
            
            <div className="space-y-4 border-t-2 border-black pt-4">
              <div className="flex justify-between font-bold text-sm">
                <span>Cost Basis:</span>
                <span>₹{totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-bold text-sm uppercase">Current P&L:</span>
                <div className="text-right">
                  <p className={`text-4xl font-black leading-none ${profitPct >= 0 ? 'text-black' : 'text-red-600'}`}>
                    {profitPct.toFixed(2)}%
                  </p>
                  <p className="font-bold text-sm mt-1">₹{profitAmt.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <button 
              disabled={!isTargetMet}
              className={`w-full mt-6 p-4 font-black uppercase border-4 border-black transition-all ${isTargetMet ? 'bg-black text-white hover:bg-white hover:text-black active:translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {isTargetMet ? 'Record Sell Batch' : 'Target Not Met'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};