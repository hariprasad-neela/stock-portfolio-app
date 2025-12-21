import { useDispatch, useSelector } from 'react-redux';
import { fetchLedger, setPage, setTickerFilter, removeTransaction } from '../store/slices/ledgerSlice';
import { useEffect, useState } from 'react';
import { openModal } from '../store/slices/uiSlice';

const LedgerPage = () => {
    const dispatch = useDispatch();
    const ledgerState = useSelector((state) => state.ledger) || {};
    const [searchTerm, setSearchTerm] = useState('');
    // Destructure with safe fallbacks
    const {
        items = [],
        pagination = { currentPage: 1, totalPages: 1 },
        filters = { ticker: '' },
        loading = false,
        limit = 10
    } = ledgerState;

    useEffect(() => {
        const promise = dispatch(fetchLedger({
            page: pagination.currentPage,
            limit: 10,
            ticker: filters.ticker
        }));

        // Cleanup function to abort previous request if user types fast
        return () => promise.abort();
    }, [pagination.currentPage, filters.ticker, dispatch]);

    useEffect(() => {
        // Set a timer to dispatch the filter after 500ms of no typing
        const delayDebounceFn = setTimeout(() => {
            dispatch(setTickerFilter(searchTerm));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, dispatch]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this trade?")) {
            dispatch(removeTransaction(id)).then(() => {
                dispatch(fetchLedger({ page: 1, limit: 10 })); // Refresh list
            });
        }
    };

    const handleEdit = (transaction) => {
    dispatch(openModal(transaction)); // Passes the whole tx object to uiSlice
};

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transaction Ledger</h1>
                    <p className="text-slate-500 font-medium">History of all your trades</p>
                </div>
                {/* Search Filter */}
                <input
                    className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Filter by Ticker..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticker</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                            <th className="px-6 py-3 text-right text-xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {items.map(tx => (
                            <tr key={tx.transaction_id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-semibold text-slate-600">{tx.date}</td>
                                <td className="px-6 py-4 text-sm font-black text-slate-900">{tx.ticker}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700 text-right">{tx.quantity}</td>
                                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900 text-right">₹{parseFloat(tx.price).toFixed(2)}</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button
                                        onClick={() => handleEdit(tx)}
                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                    >
                                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tx.transaction_id)}
                                        className="text-rose-400 hover:text-rose-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => dispatch(setPage(pagination.currentPage - 1))}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-blue-600 disabled:opacity-30"
                    >
                        Previous
                    </button>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => dispatch(setPage(pagination.currentPage + 1))}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-blue-600 disabled:opacity-30"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LedgerPage;