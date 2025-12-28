import React, { useState, useEffect } from 'react';

export const BatchesPage = () => {
  const [unbatchedPairs, setUnbatchedPairs] = useState([]);
  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
  const [batchName, setBatchName] = useState('');

  // 1. Fetch pairs that are ready to be batched
  // Logic: Closed BUYs and their linked SELLs
  const fetchUnbatched = async () => {
    const res = await fetch(`${API_BASE}/api/batches/unbatched`);
    const data = await res.json();
    setUnbatchedPairs(data);
  };

  const handleCreateBatch = async () => {
    if (!batchName || selectedPairs.length === 0) return alert("Select pairs and name the batch!");
    
    await fetch(`${API_BASE}/api/batches/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_name: batchName, transaction_ids: selectedPairs })
    });
    
    setBatchName('');
    setSelectedPairs([]);
    fetchUnbatched();
  };

  return (
    <div className="space-y-8">
      {/* BATCH CREATION ZONE */}
      <section className="bg-yellow-50 border-4 border-dashed border-black p-6">
        <h2 className="text-2xl font-black uppercase italic mb-4">Create New Batch</h2>
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Batch Name (e.g. SILVER_PROFIT_Q4)" 
            className="flex-1 border-4 border-black p-3 font-black uppercase"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
          <button 
            onClick={handleCreateBatch}
            className="bg-black text-white px-8 font-black uppercase hover:bg-green-500 hover:text-black transition-colors"
          >
            Finalize Batch
          </button>
        </div>

        {/* LIST OF UNBATCHED PAIRS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unbatchedPairs.map(pair => (
            <div 
              key={pair.sell_id}
              onClick={() => setSelectedPairs(prev => prev.includes(pair.sell_id) ? prev.filter(id => id !== pair.sell_id) : [...prev, pair.sell_id, pair.buy_id])}
              className={`p-4 border-4 border-black cursor-pointer transition-all ${selectedPairs.includes(pair.sell_id) ? 'bg-black text-white translate-x-1' : 'bg-white'}`}
            >
              <div className="flex justify-between font-black">
                <span>{pair.ticker}</span>
                <span className={selectedPairs.includes(pair.sell_id) ? 'text-green-400' : 'text-green-600'}>
                  +₹{pair.profit}
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold opacity-70">
                Bought: {pair.buy_date} | Sold: {pair.sell_date}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};