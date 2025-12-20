const LedgerPage = () => {
    const dispatch = useDispatch();
    const { items, pagination, filters, loading } = useSelector(state => state.ledger);

    useEffect(() => {
        dispatch(fetchLedger({ page: pagination.currentPage, limit: pagination.limit, ticker: filters.ticker }));
    }, [pagination.currentPage, filters.ticker]);

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
                    onChange={(e) => dispatch(setTickerFilter(e.target.value))}
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
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {items.map(tx => (
                            <tr key={tx.transaction_id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-semibold text-slate-600">{tx.date}</td>
                                <td className="px-6 py-4 text-sm font-black text-slate-900">{tx.ticker}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        tx.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-slate-700 text-right">{tx.quantity}</td>
                                <td className="px-6 py-4 text-sm font-mono font-bold text-slate-900 text-right">₹{parseFloat(tx.price).toFixed(2)}</td>
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