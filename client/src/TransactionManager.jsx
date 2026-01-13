// client/src/TransactionManager.jsx
import React, { useState, useEffect } from 'react';
import api from './api';
import { SUPPORTED_STOCKS, APP_CONFIG } from './constants';
import { API_URLS } from './utils/apiUrls';

const TransactionManager = ({ onEditTriggered }) => {
    const [transactions, setTransactions] = useState([]);
    const [filterTicker, setFilterTicker] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = APP_CONFIG.ITEMS_PER_PAGE || 10;

    const fetchAllTransactions = async () => {
        try {
            const response = await api.get(API_URLS.TRANSACTIONS);
            setTransactions(response.data);
        } catch (err) { console.error("Fetch failed", err); }
    };

    useEffect(() => { fetchAllTransactions(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Permanent delete? This cannot be undone.")) {
            try {
                await api.delete(`${API_URLS.TRANSACTIONS}/${id}`);
                fetchAllTransactions();
            } catch (err) { alert("Delete failed"); }
        }
    };

    const filteredData = transactions.filter(t => {
        const typeMatch = filterType === 'ALL' || t.type === filterType;
        const tickerMatch = filterTicker === 'ALL' || t.ticker === filterTicker;
        return typeMatch && tickerMatch;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Filter Header */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Transaction History</h2>
                <div className="flex gap-2">
                    <select 
                        className="rounded-lg border-slate-300 text-sm focus:ring-brand"
                        onChange={(e) => setFilterTicker(e.target.value)}
                    >
                        <option value="ALL">All Assets</option>
                        {SUPPORTED_STOCKS.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker}</option>)}
                    </select>
                    <select 
                        className="rounded-lg border-slate-300 text-sm focus:ring-brand"
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="BUY">Buy</option>
                        <option value="SELL">Sell</option>
                    </select>
                </div>
            </div>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Asset</th>
                            <th className="px-6 py-4 font-semibold">Type</th>
                            <th className="px-6 py-4 font-semibold">Qty</th>
                            <th className="px-6 py-4 font-semibold">Price</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentItems.map(t => (
                            <tr key={t.transaction_id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4 text-sm whitespace-nowrap">{new Date(t.date).toLocaleDateString('en-IN')}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{t.ticker}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${t.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">{t.quantity}</td>
                                <td className="px-6 py-4 text-sm font-mono font-medium">₹{t.price}</td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button 
                                        onClick={() => onEditTriggered(t)}
                                        className="text-brand hover:text-blue-800 font-semibold text-sm mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(t.transaction_id)}
                                        className="text-danger hover:text-red-800 font-semibold text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <p className="text-sm text-slate-500">
                    Showing {currentItems.length} of {filteredData.length} entries
                </p>
                <div className="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1 border rounded-md disabled:opacity-30 bg-white"
                    >
                        Previous
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1 border rounded-md disabled:opacity-30 bg-white"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionManager;