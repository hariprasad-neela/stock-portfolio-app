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

  return (
    <div>
      <nav style={navStyle}>
          <button onClick={() => setView('DASHBOARD')}>Dashboard</button>
          <button onClick={() => setView('TRANSACTIONS')}>Ledger</button>
          <button onClick={handleOpenAdd}>+ Add Transaction</button>
      </nav>

      {showForm && (
        <TransactionForm 
          editData={transactionToEdit} 
          onClose={handleFormClose} 
        />
      )}

      {view === 'DASHBOARD' ? <StrategyDashboard /> : <TransactionManager onEditTriggered={handleOpenEdit} />}
    </div>
  );
}

const navStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 30px', background: '#2c3e50', alignItems: 'center' };
const tab = { background: 'none', border: 'none', color: '#bdc3c7', cursor: 'pointer', fontSize: '16px' };
const activeTab = { ...tab, color: '#fff', fontWeight: 'bold', borderBottom: '2px solid #fff' };
const addBtn = { background: '#27ae60', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' };
const formOverlay = { background: '#f9f9f9', padding: '20px', border: '1px solid #ddd', marginBottom: '20px', borderRadius: '8px' };

export default App;