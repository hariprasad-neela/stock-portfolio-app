import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUnbatchedPairs } from '../store/slices/batchesSlice';
import { uiTheme } from '../theme/uiTheme';

export const BatchesPage = () => {
  const dispatch = useDispatch();
  const { unbatchedPairs, status } = useSelector((state: RootState) => state.batches);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchName, setBatchName] = useState('');

  // Fetch only if not already loaded
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUnbatchedPairs());
    }
  }, [status, dispatch]);

  const handleToggle = (buyId: string, sellId: string) => {
    setSelectedIds(prev => {
      const exists = prev.includes(buyId);
      if (exists) {
        return prev.filter(id => id !== buyId && id !== sellId);
      } else {
        return [...prev, buyId, sellId]; // We need both for the UPDATE query
      }
    });
  };

  const totalPnL = unbatchedPairs
    .filter(p => selectedIds.includes(p.buy_id))
    .reduce((sum, p) => sum + Number(p.realized_pnl), 0);

  if (status === 'loading') return <div className="p-10 font-black">LOADING PAIRS...</div>;

  return (
    <div className={uiTheme.layout.container}>
      <h1 className={uiTheme.text.h1}>Batching Room</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className={uiTheme.table.wrapper}>
            <table className={uiTheme.table.base}>
              <thead>
                <tr className={uiTheme.table.th}>
                  <th className="p-4">Select</th>
                  <th className="p-4">Ticker</th>
                  <th className="p-4">Buy Price</th>
                  <th className="p-4">Sell Price</th>
                  <th className="p-4">Realized P&L</th>
                </tr>
              </thead>
              <tbody>
                {unbatchedPairs.map((pair) => (
                  <tr key={pair.sell_id} className={uiTheme.table.row}>
                    <td className={uiTheme.table.td}>
                      <input 
                        type="checkbox" 
                        className={uiTheme.inventory.checkbox}
                        checked={selectedIds.includes(pair.buy_id)}
                        onChange={() => handleToggle(pair.buy_id, pair.sell_id)}
                      />
                    </td>
                    <td className={uiTheme.table.td + " font-black"}>{pair.ticker}</td>
                    <td className={uiTheme.table.td}>₹{pair.buy_price}</td>
                    <td className={uiTheme.table.td}>₹{pair.sell_price}</td>
                    <td className={`${uiTheme.table.td} ${Number(pair.realized_pnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Number(pair.realized_pnl).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel */}
        <div className={uiTheme.layout.section + " h-fit sticky top-24"}>
          <h2 className={uiTheme.text.h2}>Group Selection</h2>
          <input 
            className={uiTheme.form.input + " mb-4"} 
            placeholder="Batch Name (e.g. Q1_Recovery)" 
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
          <div className="bg-gray-100 p-4 border-2 border-black mb-4">
            <div className="flex justify-between font-bold">
              <span>Pairs:</span> <span>{selectedIds.length / 2}</span>
            </div>
            <div className="flex justify-between font-black text-xl mt-2">
              <span>Net P&L:</span>
              <span className={totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                ₹{totalPnL.toLocaleString()}
              </span>
            </div>
          </div>
          <button 
            className={uiTheme.button.primary + " w-full disabled:opacity-50"}
            disabled={!batchName || selectedIds.length === 0}
            onClick={() => handleCreateBatch()} // We'll implement this next
          >
            CONFIRM BATCH
          </button>
        </div>
      </div>
    </div>
  );
};