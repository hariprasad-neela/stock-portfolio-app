// client/src/App.jsx (Updated)
import { useState, useEffect } from 'react';
import api from './api'; 
import TransactionForm from './TransactionForm';
import StrategyDashboard from './StrategyDashboard'; // <-- Import the new dashboard
import './App.css';

function App() {
  const [dbStatus, setDbStatus] = useState('Checking connection...');

  // ... (rest of the useEffect and checkConnection function remain the same) ...
  useEffect(() => {
    // This logic ensures the status check runs only once on load
    const checkConnection = async () => {
      try {
        const response = await api.get('/test-db');
        if (response.data.success) {
          setDbStatus(`✅ LIVE Connection to Supabase! Server Time: ${new Date(response.data.time).toLocaleString()}`);
        } else {
          setDbStatus('❌ Database Connected but returned error.');
        }
      } catch (error) {
        console.error("Connection failed:", error);
        setDbStatus('❌ Cannot connect to Backend. Is Render running?');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="app-container">
      <header style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
        <h1>Multi-Asset Strategy Manager 📈</h1>
      </header>

      <main style={{ padding: '20px' }}>
        {/* System Status Row */}
        <div style={{ marginBottom: '25px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#e9e9f4' }}>
          <h3>System Status: <span style={{ fontWeight: 'normal', fontSize: '0.9em' }}>{dbStatus}</span></h3>
        </div>

        {/* Dashboard and Form Row */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            
            {/* Left Column: Dashboard (Takes up more space) */}
            <div style={{ flex: 3 }}>
                <StrategyDashboard />
            </div>

            {/* Right Column: Transaction Form (Needs less space) */}
            <div style={{ flex: 1, minWidth: '350px' }}>
                <TransactionForm />
            </div>
        </div>
      </main>
      {/* Optional: Simple Navigation Area for future expansion */}
      <footer style={{ padding: '10px 20px', backgroundColor: '#343a40', color: '#ccc', textAlign: 'center' }}>
          Navigation: Dashboard | Quarterly Review (Coming Soon)
      </footer>
    </div>
  );
}

export default App;