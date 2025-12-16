// client/src/App.jsx (Updated)
import { useState, useEffect } from 'react';
import api from './api'; 
import TransactionForm from './TransactionForm';
import StrategyDashboard from './StrategyDashboard'; // <-- Import the new dashboard
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  return (
    <div className="app-container">
      <nav style={navStyle}>
        <button onClick={() => setActiveTab('DASHBOARD')}>Dashboard</button>
        <button onClick={() => setActiveTab('TRANSACTIONS')}>History & Edit</button>
      </nav>

      <main style={{ padding: '20px' }}>
        {activeTab === 'DASHBOARD' ? <StrategyDashboard /> : <TransactionManager />}
      </main>
    </div>
  );
}

const navStyle = { display: 'flex', gap: '20px', padding: '10px 20px', background: '#2c3e50', color: 'white' };

export default App;