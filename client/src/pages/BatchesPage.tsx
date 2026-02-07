import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBatch, fetchUnbatchedPairs } from '../store/slices/batchesSlice';
import { uiTheme } from '../theme/uiTheme';
import { formatDate } from '../utils';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '../utils/apiUrls';
import { formatRupee } from '../utils';
import { format } from 'node:path/win32';

export const BatchesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation

  const { unbatchedPairs, status } = useSelector((state) => state.batches);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchName, setBatchName] = useState('');
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [batches, setBatches] = useState([]);
  const [filterTicker, setFilterTicker] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  const [globalSummary, setGlobalSummary] = useState({ totalProfit: 0, totalUnits: 0, totalBatches: 0 });

  const handleCreateBatch = async () => {
    // 1. Validation check
    if (!batchName.trim() || !batchDate || selectedIds.length === 0) {
      alert("Please provide a batch name, date and select at least one pair.");
      return;
    }

    try {
      // 2. Dispatch the thunk
      // .unwrap() allows us to use standard try/catch logic on the thunk result
      const profit = unbatchedPairs
        .filter(p => selectedIds.includes(p.buy_id))
        .reduce((sum, p) => sum + Number(p.realized_pnl), 0);

      await dispatch(createBatch({
        batch_name: batchName,
        batch_date: batchDate,
        profit: profit,
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

  // Inside BatchesPage component
  useEffect(() => {
    if (selectedIds.length > 0 && !batchName) {
      const firstPair = unbatchedPairs.find(p => selectedIds.includes(p.buy_id));
      if (firstPair) {
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        setBatchName(`${firstPair.ticker} ${today}`);
      }
    }
  }, [selectedIds, unbatchedPairs]);

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
  }, [filterTicker]);

  const fetchTransactions = async (page = 1) => {
    try {
      const res = await fetch(`${API_URLS.BATCHES}?page=${page}&limit=10&ticker=${filterTicker}`);
      const { data, pagination, summary } = await res.json();

      setBatches(data);
      setGlobalSummary(summary); // Set the global stats here
      setPagination(pagination);
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

      {/* SUMMARY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* TOTAL BATCHES */}
        <div className="bg-purple-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-black text-xs uppercase mb-1 text-black/60">Executed Batches</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black">{globalSummary.totalBatches}</span>
            <span className="text-xl pb-1">📦</span>
          </div>
        </div>

        {/* TOTAL ATOMIC UNITS */}
        <div className="bg-blue-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-black text-xs uppercase mb-1 text-black/60">Total Atomic Units</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black">{globalSummary.totalUnits}</span>
            <span className="text-xl pb-1">⚛️</span>
          </div>
        </div>

        {/* TOTAL    */}
        <div className="bg-green-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-black text-xs uppercase mb-1 text-black/60">Realized Profit</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black">{formatRupee(globalSummary.totalProfit) }</span>
            <span className="text-xl pb-1">💰</span>
          </div>
        </div>
      </div>

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
                {formatRupee(totalPnL)}
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
      {/* Batch Card Layout (Replace the Batches table body) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {batches.map((batch) => (
          <div key={batch.batch_id} className="border-4 border-black p-4 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">{batch.batch_name}</h3>
                <p className="text-xs font-bold text-gray-500">{formatDate(batch.batch_date)}</p>
              </div>
              <button
                onClick={() => navigate(`/batches/edit/${batch.batch_id}`)}
                className="underline font-black hover:text-blue-600"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t-2 border-black pt-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase">Units Traded</span>
                <span className="font-bold">{batch.total_units}</span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-[10px] font-black text-gray-400 uppercase">Profit</span>
                <span className="font-bold">{formatRupee(batch.profit)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-gray-400 uppercase">Avg. Duration</span>
                <span className="font-bold">{Math.round(batch.total_days_held / batch.total_units)} Days</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-8">
        <button
          disabled={pagination.currentPage === 1}
          onClick={() => fetchTransactions(pagination.currentPage - 1)}
          className={uiTheme.button.secondary}
        >
          Previous
        </button>
        <span className="font-black self-center">Page {pagination.currentPage} of {pagination.totalPages}</span>
        <button
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => fetchTransactions(pagination.currentPage + 1)}
          className={uiTheme.button.secondary}
        >
          Next
        </button>
      </div>
    </div>
  );
};