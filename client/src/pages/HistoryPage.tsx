import React, { useState, useEffect } from 'react';
import { TransactionModal } from '../components/modals/TransactionModal';
import { uiTheme } from '../theme/uiTheme';
import { formatDate } from '../utils';

export const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filterTicker, setFilterTicker] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingData, setEditingData] = useState<any>(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchTransactions(1);
  }, [page, filterTicker]);

  const fetchTransactions = async (page = 1) => {
    try {
      const res = await fetch(`${API_BASE}/api/transactions?page=${page}&limit=10&ticker=${filterTicker}`);
      const {data, pagination} = await res.json();

      setTransactions(data);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this transaction?")) return;
    await fetch(`${API_BASE}/api/transactions/${id}`, { method: 'DELETE' });
    fetchTransactions();
  };

  const handleSave = async (formData: any) => {
    const isEditing = !!formData.transaction_id;
    const url = isEditing
      ? `${API_BASE}/api/transactions/${formData.transaction_id}`
      : `${API_BASE}/api/transactions`;

    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: formData.ticker,
          quantity: parseFloat(formData.quantity),
          price: parseFloat(formData.price),
          date: formData.date,
          type: formData.type,
          parent_buy_id: formData.parent_buy_id
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingData(null); // Clear the edit state
        fetchTransactions();  // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save'}`);
      }
    } catch (err) {
      console.error("Save Error:", err);
      alert("Network error. Check your connection.");
    }
  };

  const openAddModal = () => {
    setEditingData(null); // Ensure form is empty for new entries
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (tx: any) => {
    // Format the date to YYYY-MM-DD so the <input type="date"> can read it
    const formattedDate = new Date(tx.date).toISOString().split('T')[0];

    setEditingData({
      ...tx,
      date: formattedDate
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  return (
    <div className={uiTheme.layout.container}>
      {/* Responsive Header */}
      <div className={uiTheme.history.header}>
        <h1 className={uiTheme.history.title}>Transaction History</h1>
        <button 
          onClick={openAddModal}
          className={uiTheme.history.addButton}
        >
          + Add Transaction
        </button>
        <input
          type="text"
          placeholder="Filter Ticker..."
          className="border-2 border-black p-2 font-bold uppercase outline-none focus:bg-yellow-50"
          onChange={(e) => setFilterTicker(e.target.value)}
        />
      </div>

{/* Responsive Table Wrapper */}
      <div className={uiTheme.table.wrapper}>
        <table className={uiTheme.table.base}>
          <thead>
            <tr>
              <th className={uiTheme.table.th}>Date</th>
              <th className={uiTheme.table.th}>Ticker</th>
              <th className={uiTheme.table.th}>Type</th>
              <th className={uiTheme.table.th}>Qty</th>
              <th className={uiTheme.table.th}>Price</th>
              <th className={uiTheme.table.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.map((tx: any) => (
              <tr key={tx.transaction_id} className={uiTheme.table.row}>
                <td className={uiTheme.table.td}>{formatDate(tx.date)}</td>
                <td className={uiTheme.table.td}>{tx.ticker}</td>
                <td className={uiTheme.table.td}>
                  {tx.type} {' '}
                  {tx.parent_buy_id ? <a title={tx.parent_buy_id}>P</a> : ''}{' '}
                  {tx.is_open ? 'O' : 'C'}
                </td>
                <td className={uiTheme.table.td}>{parseFloat(tx.quantity).toLocaleString('en-IN')}</td>
                <td className={uiTheme.table.td}>₹{parseFloat(tx.price).toFixed(2)}</td>
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

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingData}
        mode={modalMode}
      />

      {/* PAGINATION CONTROLS */}
      <div className="mt-8 flex items-center justify-between bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="font-black uppercase text-xs">
          {/* Added conditional checks to prevent empty "PAGE OF" */}
          {pagination.totalPages > 0
            ? `Page ${pagination.currentPage} of ${pagination.totalPages}`
            : "Loading records..."}
        </div>

        <div className="flex gap-2">
          <button
            disabled={pagination.currentPage <= 1}
            onClick={() => fetchTransactions(pagination.currentPage - 1)}
            className={`${uiTheme.button.secondary} py-1 px-3 disabled:opacity-30 disabled:border-gray-300 disabled:text-gray-300`}
          >
            PREV
          </button>

          <div className="hidden md:flex gap-1">
            {/* Generate an array of page numbers safely */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => fetchTransactions(pageNum)}
                className={`w-10 h-10 border-4 border-black font-black transition-colors ${pagination.currentPage === pageNum ? 'bg-yellow-400 text-black' : 'bg-white hover:bg-gray-100'
                  }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => fetchTransactions(pagination.currentPage + 1)}
            className={`${uiTheme.button.secondary} py-1 px-3 disabled:opacity-30 disabled:border-gray-300 disabled:text-gray-300`}
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};