// client/src/App.jsx
import { useState, useEffect } from 'react';
import api from './api'; 
import TransactionForm from './TransactionForm'; // <-- Import the new component
import './App.css';

function App() {
  const [dbStatus, setDbStatus] = useState('Checking connection...');

  useEffect(() => {
    // This logic ensures the status check runs only once on load
    const checkConnection = async () => {
      try {
        // Now calling the LIVE Render endpoint
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
        <h1>My Indian Stock Portfolio 📈</h1>
      </header>

      <main style={{ padding: '20px', display: 'flex', gap: '30px' }}>
        {/* Left Column: System Status */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#e9e9f4' }}>
            <h3>System Status:</h3>
            <p style={{ fontWeight: 'bold' }}>{dbStatus}</p>
          </div>
        </div>

        {/* Right Column: Transaction Form */}
        <div style={{ flex: 2, minWidth: '400px' }}>
          <TransactionForm /> {/* <-- Render the Form */}
        </div>
      </main>
    </div>
  );
}

export default App;