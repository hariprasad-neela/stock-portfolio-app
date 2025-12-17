// client/src/App.jsx
import React, { useState } from 'react';
import StrategyDashboard from './StrategyDashboard';
import TransactionManager from './TransactionManager';
import TransactionForm from './TransactionForm'; // Your BUY form

function App() {
  const [view, setView] = useState('DASHBOARD');
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Top Navigation */}
      <nav style={navStyle}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setView('DASHBOARD')} style={view === 'DASHBOARD' ? activeTab : tab}>Dashboard</button>
          <button onClick={() => setView('TRANSACTIONS')} style={view === 'TRANSACTIONS' ? activeTab : tab}>Ledger</button>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={addBtn}>
          {showAddForm ? 'Close Form' : '+ Add Transaction'}
        </button>
      </nav>

      <div style={{ padding: '20px' }}>
        {/* Conditional Add Form */}
        {showAddForm && (
          <div style={formOverlay}>
            <TransactionForm onTransactionAdded={() => setShowAddForm(false)} />
          </div>
        )}

        {/* Screen Content */}
        {view === 'DASHBOARD' ? <StrategyDashboard /> : <TransactionManager />}
      </div>
    </div>
  );
}

const navStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 30px', background: '#2c3e50', alignItems: 'center' };
const tab = { background: 'none', border: 'none', color: '#bdc3c7', cursor: 'pointer', fontSize: '16px' };
const activeTab = { ...tab, color: '#fff', fontWeight: 'bold', borderBottom: '2px solid #fff' };
const addBtn = { background: '#27ae60', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' };
const formOverlay = { background: '#f9f9f9', padding: '20px', border: '1px solid #ddd', marginBottom: '20px', borderRadius: '8px' };

export default App;