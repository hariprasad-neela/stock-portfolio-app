import React, { useState, useEffect } from 'react';
import api from './api';

const TransactionManager = () => {
    const [transactions, setTransactions] = useState([]);
    const [filterType, setFilterType] = useState('ALL'); // ALL, BUY, SELL
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, OPEN, CLOSED
    const [loading, setLoading] = useState(false);

    const fetchAllTransactions = async () => {
        try {
            const response = await api.get('/api/transactions'); // This matches app.use + router.get('/')
            setTransactions(response.data);
        } catch (err) {
            console.error("404 Error: Check if backend is deployed with the new GET route.");
        }
    };

    useEffect(() => { fetchAllTransactions(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            await api.delete(`/api/transactions/${id}`);
            fetchAllTransactions();
        }
    };

    // Filtering Logic
    const filteredData = transactions.filter(t => {
        const typeMatch = filterType === 'ALL' || t.type === filterType;
        const statusMatch = filterStatus === 'ALL' || 
                           (filterStatus === 'OPEN' ? t.is_open === true : t.is_open === false);
        return typeMatch && statusMatch;
    });

    return (
        <div style={containerStyle}>
            <h2>Transaction Ledger</h2>
            
            {/* Filter Bar */}
            <div style={filterBarSyle}>
                <select onChange={(e) => setFilterType(e.target.value)}>
                    <option value="ALL">All Types</option>
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                </select>

                <select onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open (Unsold)</option>
                    <option value="CLOSED">Closed (Sold)</option>
                </select>
            </div>

            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Ticker</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map(t => (
                        <tr key={t.transaction_id}>
                            <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                            <td>{t.ticker}</td>
                            <td style={{ color: t.type === 'BUY' ? 'green' : 'red' }}>{t.type}</td>
                            <td>{t.quantity}</td>
                            <td>₹{t.price}</td>
                            <td>{t.type === 'BUY' ? (t.is_open ? '🟢 Open' : '⚪ Closed') : '-'}</td>
                            <td>
                                <button onClick={() => handleDelete(t.transaction_id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ... Styles ...
const containerStyle = { padding: '20px', backgroundColor: '#fff', borderRadius: '8px' };
const filterBarSyle = { marginBottom: '20px', display: 'flex', gap: '10px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };

export default TransactionManager;