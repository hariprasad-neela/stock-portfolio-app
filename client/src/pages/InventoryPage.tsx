import React, { useState, useEffect } from 'react';
import { LotSelectorCard } from '../features/inventory/LotSelectorCard';

export const InventoryPage = () => {
  const [ticker, setTicker] = useState('');
  const [lots, setLots] = useState([]);
  const [selectedLotIds, setSelectedLotIds] = useState<number[]>([]);
  const [cmp, setCmp] = useState<number>(0);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  // Calculate Stats for Selected Lots
  const selectedLotsData = lots.filter(lot => selectedLotIds.includes(lot.id));
  const totalCost = selectedLotsData.reduce((acc, lot) => acc + (lot.buy_price * lot.quantity), 0);
  const currentVal = selectedLotsData.reduce((acc, lot) => acc + (cmp * lot.quantity), 0);
  
  const profitAmt = currentVal - totalCost;
  const profitPct = totalCost > 0 ? (profitAmt / totalCost) * 100 : 0;
  const isTargetMet = profitPct >= 3.0;

  const fetchInventoryAndPrice = async () => {
    if (!ticker) return;
    try {
      // 1. Fetch Lots
      const invRes = await fetch(`${API_BASE}/api/strategy/open-inventory/${ticker.toUpperCase()}`);
      const invData = await invRes.json();
      setLots(invData);

      // 2. Fetch CMP
      const priceRes = await fetch(`${API_BASE}/api/market/quotes?symbols=NSE:${ticker.toUpperCase()}`);
      const priceData = await priceRes.json();
      setCmp(priceData[`NSE:${ticker.toUpperCase()}`] || 0);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const toggleLot = (id: number) => {
    setSelectedLotIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {/* Search Input here... (omitted for brevity) */}
        {lots.map(lot => (
          <LotSelectorCard 
            key={lot.id} 
            lot={lot} 
            cmp={cmp}
            isSelected={selectedLotIds.includes(lot.id)}
            onToggle={() => toggleLot(lot.id)}
          />
        ))}
      </div>

      {/* DYNAMIC BATCH SUMMARY */}
      <div className="lg:col-span-1">
        <div className={`sticky top-24 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500 ${isTargetMet ? 'bg-green-400' : 'bg-white'}`}>
          <h3 className="font-black uppercase text-2xl mb-2">Strategy Monitor</h3>
          <p className="text-xs font-bold uppercase mb-4 text-gray-600">Target: 3% Profit</p>
          
          <div className="space-y-4 border-t-2 border-black pt-4">
            <div className="flex justify-between font-bold">
              <span>Selected Cost:</span>
              <span>₹{totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end">
              <span className="font-bold">Current P&L:</span>
              <div className="text-right">
                <p className={`text-3xl font-black ${profitPct >= 0 ? 'text-black' : 'text-red-600'}`}>
                  {profitPct.toFixed(2)}%
                </p>
                <p className="text-xs font-bold">₹{profitAmt.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <button 
            disabled={!isTargetMet}
            className={`w-full mt-6 p-4 font-black uppercase border-2 border-black transition-all ${isTargetMet ? 'bg-black text-white hover:bg-white hover:text-black' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {isTargetMet ? 'Execute Sell Batch' : 'Target Not Met'}
          </button>
        </div>
      </div>
    </div>
  );
};