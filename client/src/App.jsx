// client/src/App.jsx
import { useState, useEffect } from 'react';
import api from './api'; // Import our helper
import './App.css';

function App() {
  const [dbStatus, setDbStatus] = useState('Checking connection...');

  useEffect(() => {
    // This runs when the page loads
    const checkConnection = async () => {
      try {
        const response = await api.get('/test-db');
        if (response.data.success) {
          setDbStatus(`✅ Connected to Database! Server Time: ${response.data.time}`);
        } else {
          setDbStatus('❌ Database Connected but returned error.');
        }
      } catch (error) {
        console.error("Connection failed:", error);
        setDbStatus('❌ Cannot connect to Backend. Is it running?');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="app-container">
      <header style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
        <h1>My Stock Portfolio 📈</h1>
      </header>

      <main style={{ padding: '20px' }}>
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>System Status:</h3>
          <p>{dbStatus}</p>
        </div>
      </main>
    </div>
  );
}

export default App;