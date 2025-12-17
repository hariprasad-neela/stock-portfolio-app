// client/src/App.jsx
import React, { useState } from 'react';
import StrategyDashboard from './StrategyDashboard';
import TransactionManager from './TransactionManager';
import TransactionForm from './TransactionForm'; // Your BUY form

function App() {
  const [view, setView] = useState('DASHBOARD');
  const [showForm, setShowForm] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  const handleOpenAdd = () => {
    setTransactionToEdit(null); // Clear any previous edit data
    setShowForm(true);
  };

  const handleOpenEdit = (transaction) => {
    setTransactionToEdit(transaction); // Set the specific row data
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setTransactionToEdit(null);
  };

  const NavButton = ({ active, onClick, label }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-blue-600">PRO-TRADE</span>
            <div className="hidden md:flex gap-1">
              <NavButton active={view === 'DASHBOARD'} onClick={() => setView('DASHBOARD')} label="Dashboard" />
              <NavButton active={view === 'TRANSACTIONS'} onClick={() => setView('TRANSACTIONS')} label="Ledger" />
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            + Add Entry
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'DASHBOARD' ? <StrategyDashboard /> : <TransactionManager onEditTriggered={handleOpenEdit} />}
      </main>

      // The Modal Fragment
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={handleFormClose} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6">
              <h2 className="text-2xl font-bold text-slate-900">{transactionToEdit ? 'Edit Position' : 'New Position'}</h2>
              <p className="text-slate-500 text-sm mb-6">Enter details for your transaction.</p>
              <TransactionForm editData={transactionToEdit} onClose={handleFormClose} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

const navStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 30px', background: '#2c3e50', alignItems: 'center' };
const tab = { background: 'none', border: 'none', color: '#bdc3c7', cursor: 'pointer', fontSize: '16px' };
const activeTab = { ...tab, color: '#fff', fontWeight: 'bold', borderBottom: '2px solid #fff' };
const addBtn = { background: '#27ae60', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' };
const formOverlay = { background: '#f9f9f9', padding: '20px', border: '1px solid #ddd', marginBottom: '20px', borderRadius: '8px' };

export default App;