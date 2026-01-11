import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { uiTheme } from '../../theme/uiTheme';
import { fetchUnbatchedPairs } from '../../store/slices/batchesSlice';
import { formatDate } from '../../utils';
import { API_URLS } from '../../utils/apiUrls';

export const BatchEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { unbatchedPairs } = useSelector((state) => state.batches);

  const [batchData, setBatchData] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const loadBatch = async () => {
      const res = await fetch(`${API_URLS.BATCH_DETAILS}${id}`);
      const data = await res.json();
      setBatchData(data);
      // Map existing pairs into the selected IDs state
      const existingIds = data.currentPairs.flatMap((p: any) => [p.buy_id, p.sell_id]);
      setSelectedIds(existingIds);
      setLoading(false);
    };
    loadBatch();
    dispatch(fetchUnbatchedPairs());
  }, [id]);

  const handleUpdate = async () => {
    try {
      await fetch(`${API_URLS.BATCH_DETAILS}${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_name: batchData.batch_name,
          batch_date: batchData.batch_date,
          transaction_ids: selectedIds
        })
      });
      alert("Batch updated and stats recalculated!");
      navigate('/batches');
    } catch (err) {
      alert("Update failed");
    }
  };

  if (loading) return <div className="p-10 font-black">INITIALIZING EDIT ROOM...</div>;

  // Filter unbatched pairs to only show the same ticker as the batch
  // Note: We check currentPairs[0] because all pairs in a batch are of the same ticker
  const relevantUnbatched = unbatchedPairs.filter(p => p.ticker === batchData.currentPairs[0]?.ticker);

  return (
    <div className={uiTheme.layout.container}>
      <div className="flex justify-between items-center mb-8 border-b-8 border-black pb-4">
        <div>
          <button onClick={() => navigate('/batches')} className="text-xs font-black uppercase underline mb-2">← Back to Batches</button>
          <h1 className={uiTheme.text.h1}>Editing: {batchData.batch_name}</h1>
        </div>
        <button onClick={handleUpdate} className={uiTheme.button.primary}>Save Changes</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Meta & Logic */}
        <div className="space-y-6">
          <div className={uiTheme.layout.section}>
            <h2 className={uiTheme.text.h2}>Batch Details</h2>
            <label className={uiTheme.form.label}>Rename Batch</label>
            <input 
              className={uiTheme.form.input} 
              value={batchData.batch_name}
              onChange={(e) => setBatchData({...batchData, batch_name: e.target.value})}
            />
            <label className={uiTheme.form.label + " mt-4"}>Execution Date</label>
            <input 
              type="date" 
              className={uiTheme.form.input} 
              value={batchData.batch_date.split('T')[0]}
              onChange={(e) => setBatchData({...batchData, batch_date: e.target.value})}
            />
          </div>

          <div className="bg-black text-white p-6 shadow-[8px_8px_0px_0px_rgba(255,255,0,1)]">
             <h3 className="font-black italic uppercase text-xl mb-2">Selection Logic</h3>
             <p className="text-sm">You are grouping <span className="text-yellow-400 font-black">{selectedIds.length / 2} pairs</span>.</p>
             <p className="text-[10px] text-gray-400 mt-4">Removing a pair here returns it to the "Unbatched" pool. Adding an unbatched pair locks it into this ledger entry.</p>
          </div>
        </div>

        {/* RIGHT: Pair Manager */}
        <div className="space-y-4">
          <h2 className={uiTheme.text.h2}>Manage Pairs ({batchData.currentPairs[0]?.ticker})</h2>
          
          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
            {/* COMBINED LIST: Existing + Available */}
            {[...batchData.currentPairs, ...relevantUnbatched].map((pair) => {
              const isSelected = selectedIds.includes(pair.buy_id);
              return (
                <div 
                  key={pair.buy_id}
                  onClick={() => {
                    setSelectedIds(prev => isSelected 
                      ? prev.filter(id => id !== pair.buy_id && id !== pair.sell_id)
                      : [...prev, pair.buy_id, pair.sell_id]
                    );
                  }}
                  className={`border-4 border-black p-3 cursor-pointer transition-all ${
                    isSelected ? 'bg-green-100 translate-x-1' : 'bg-white opacity-60 grayscale'
                  }`}
                >
                  <div className="flex justify-between font-black text-xs">
                    <span>{formatDate(pair.buy_date)} → {formatDate(pair.sell_date)}</span>
                    <span className={Number(pair.realized_pnl) >= 0 ? 'text-green-700' : 'text-red-600'}>
                      ₹{Number(pair.realized_pnl).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-500 mt-1">
                    Qty: {pair.quantity} | Buy: ₹{pair.buy_price} | Sell: ₹{pair.sell_price}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};