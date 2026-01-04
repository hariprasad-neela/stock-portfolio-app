import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBatch, fetchUnbatchedPairs } from '../store/slices/batchesSlice';
import { uiTheme } from '../theme/uiTheme';
import { store } from '../store/index';
import { formatDate } from '../utils';

export const BatchesPage = () => {
  const dispatch = useDispatch();
  const { unbatchedPairs, status } = useSelector((state) => state.batches);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchName, setBatchName] = useState('');
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [batches, setBatches] = useState([]);
  const [filterTicker, setFilterTicker] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const handleCreateBatch = async () => {
    // 1. Validation check
    if (!batchName.trim() || !batchDate || selectedIds.length === 0) {
      alert("Please provide a batch name, date and select at least one pair.");
      return;
    }

    try {
      // 2. Dispatch the thunk
      // .unwrap() allows us to use standard try/catch logic on the thunk result
      await dispatch(createBatch({
        batch_name: batchName,
        batch_date: batchDate,
        transaction_ids: selectedIds
      })).unwrap();

      // 3. Success Feedback
      alert(`Success: Batch "${batchName}" has been locked into the ledger.`);

      // 4. Reset Local UI State
      setBatchName('');
      setSelectedIds([]);

      // 5. Sync Redux State
      // We re-fetch unbatched pairs to remove the ones we just grouped
      dispatch(fetchUnbatchedPairs());

    } catch (error) {
      console.error("Batch Creation Failed:", error);
      alert(`Error: ${error}`);
    }
  };

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

  useEffect(() => {
    fetchTransactions(1);
  }, [pagination.currentPage, filterTicker]);

  const fetchTransactions = async (page = 1) => {
    try {
      const res = await fetch(`${API_BASE}/api/batches/batches?page=${page}&limit=10&ticker=${filterTicker}`);
      const { data, pagination } = await res.json();

      setBatches(data);
      // Match these keys exactly to your backend response
      setPagination({
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalRecords: pagination.totalRecords
      });
    } catch (err) {
      console.error("Pagination fetch failed", err);
    }
  };

  const totalPnL = unbatchedPairs
    .filter(p => selectedIds.includes(p.buy_id))
    .reduce((sum, p) => sum + Number(p.realized_pnl), 0);

  if (status === 'loading') return <div className="p-10 font-black">LOADING PAIRS...</div>;

  return (
    <div className={uiTheme.layout.container}>
      <h1 className={uiTheme.text.h1}>Batching Room</h1>

      <h2 className={uiTheme.text.h2}>Unbatched Pairs</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className={uiTheme.table.wrapper}>
            <table className={uiTheme.table.base}>
              <thead>
                <tr className={uiTheme.table.th}>
                  <th className="p-4">Select</th>
                  <th className="p-4">Ticker</th>
                  <th className="p-4">Buy Date</th>
                  <th className="p-4">Buy Price</th>
                  <th className="p-4">Sell Date</th>
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
                    <td className={uiTheme.table.td}>{formatDate(pair.buy_date)}</td>
                    <td className={uiTheme.table.td}>₹{pair.buy_price}</td>
                    <td className={uiTheme.table.td}>{formatDate(pair.sell_date)}</td>
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
          {/* DATE FIELD */}
          <div>
            <label className={uiTheme.form.label}>Batch Name</label>
            <input
              className={uiTheme.form.input + " mb-4"}
              placeholder="Batch Name (SILVERBEES JUL21)"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
          </div>
          {/* DATE FIELD */}
          <div>
            <label className={uiTheme.form.label}>Transaction Date</label>
            <input
              type="date"
              className={uiTheme.form.input}
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
            />
          </div>
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
            className={uiTheme.button.primary + " w-full disabled:opacity-50 disabled:cursor-not-allowed"}
            disabled={!batchName || selectedIds.length === 0}
            onClick={handleCreateBatch}
          >
            CONFIRM BATCH
          </button>
        </div>
      </div>

        <h2 className={uiTheme.text.h2}>Batches</h2>
        {/* Responsive Table Wrapper */}
        <div className={uiTheme.table.wrapper}>
          <table className={uiTheme.table.base}>
            <thead>
              <tr>
                <th className={uiTheme.table.th}>Batch Name</th>
                <th className={uiTheme.table.th}>Date</th>
                <th className={uiTheme.table.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches && batches.map((batch: any) => (
                <tr key={batch.batch_id} className={uiTheme.table.row}>
                  <td className={uiTheme.table.td}>{batch.batch_name}</td>
                  <td className={uiTheme.table.td}>{formatDate(batch.batch_date)}</td>
                  <td className={uiTheme.table.td}>
                    <button
                      onClick={() => openEditModal(tx)}
                      className="underline font-black"
                    >
                      Edit
                    </button> |{' '}
                    <button
                      onClick={() => handleDelete(tx.transaction_id)}
                      className="text-xs font-black uppercase text-red-600 underline decoration-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};