import React, { useState } from 'react';
import { LotSelectorCard } from '../features/inventory/LotSelectorCard';

interface OpenLot {
  id: number;
  ticker: string;
  quantity: number;
  buy_price: number;
  buy_date: string;
}

export const InventoryPage = () => {
  const [ticker, setTicker] = useState('');
  const [lots, setLots] = useState<OpenLot[]>([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const fetchInventory = async () => {
    if (!ticker) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/strategy/open-inventory/${ticker.toUpperCase()}`);
      const data = await res.json();
      setLots(data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SEARCH SECTION */}
      <section className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black uppercase mb-4 italic">Inventory Search</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="ENTER TICKER (e.g. SILVERBEES)" 
            className="flex-1 border-4 border-black p-4 font-black uppercase focus:bg-yellow-50 outline-none"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          />
          <button 
            onClick={fetchInventory}
            className="bg-black text-white px-8 py-4 font-black uppercase hover:bg-yellow-400 hover:text-black transition-colors"
          >
            Fetch Lots
          </button>
        </div>
      </section>

      {/* SELECTION WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black uppercase text-xl">Available Lots {lots.length > 0 && `(${lots.length})`}</h3>
          {loading ? (
            <p className="font-bold animate-pulse">LOADING_DATA...</p>
          ) : (
            lots.map(lot => (
              <LotSelectorCard key={lot.id} lot={lot} />
            ))
          )}
        </div>

        {/* BATCH SUMMARY SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black uppercase text-xl mb-4">Batch Builder</h3>
            <div className="space-y-2 border-t-2 border-black pt-4">
              <div className="flex justify-between font-bold">
                <span>Selected:</span>
                <span>0 Lots</span>
              </div>
              <div className="flex justify-between text-2xl font-black">
                <span>Total:</span>
                <span>₹0.00</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-black text-white p-4 font-black uppercase hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-all">
              Create ₹5,000 Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};