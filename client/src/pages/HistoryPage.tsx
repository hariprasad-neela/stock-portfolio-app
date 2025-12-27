import React, { useState, useEffect } from 'react';
import { TransactionModal } from '../components/modals/TransactionModal';

export const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterTicker, setFilterTicker] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchTransactions();
  }, [page, filterTicker]);

  const fetchTransactions = async () => {
    const res = await fetch(`${API_BASE}/api/transactions?page=${page}&ticker=${filterTicker}`);
    const json = await res.json();
    setTransactions(json.data);
    setTotalPages(json.pages);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this transaction?")) return;
    await fetch(`${API_BASE}/api/transactions/${id}`, { method: 'DELETE' });
    fetchTransactions();
  };

  // Helper to format ISO Date to Readable Indian Format
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
          type: formData.type
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
    setIsModalOpen(true);
  };

  const openEditModal = (tx: any) => {
    // Format the date to YYYY-MM-DD so the <input type="date"> can read it
    const formattedDate = new Date(tx.date).toISOString().split('T')[0];

    setEditingData({
      ...tx,
      date: formattedDate
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex justify-between items-center bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <input
          type="text"
          placeholder="Filter Ticker..."
          className="border-2 border-black p-2 font-bold uppercase outline-none focus:bg-yellow-50"
          onChange={(e) => setFilterTicker(e.target.value)}
        />
        <button
          onClick={openAddModal}
          className="bg-black text-white px-6 py-2 font-black uppercase hover:bg-yellow-400 hover:text-black transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-4 border-black">
              <th className="p-4 font-black uppercase text-sm">Date</th>
              <th className="p-4 font-black uppercase text-sm">Ticker</th>
              <th className="p-4 font-black uppercase text-sm text-right">Qty</th>
              <th className="p-4 font-black uppercase text-sm text-right">Price</th>
              <th className="p-4 font-black uppercase text-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx: any) => (
              <tr key={tx.transaction_id} className="border-b-2 border-black hover:bg-gray-50">
                <td className="p-4 font-bold text-sm">{formatDate(tx.date)}</td>
                <td className="p-4 font-black text-blue-600">{tx.ticker}</td>
                <td className="p-4 font-bold text-right">{parseFloat(tx.quantity).toLocaleString('en-IN')}</td>
                <td className="p-4 font-bold text-right">₹{parseFloat(tx.price).toFixed(2)}</td>
                <td className="p-4 text-center space-x-2">
                  <button
                    onClick={() => openEditModal(tx)}
                    className="text-xs font-black uppercase underline hover:text-blue-600"
                  >
                    Edit
                  </button>
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

      {/* PAGINATION */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={`w-10 h-10 border-2 border-black font-black ${page === i + 1 ? 'bg-yellow-400' : 'bg-white'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingData}
      />
    </div>
  );
};