// client/src/TransactionManager.jsx (ENHANCED)
import React, { useState, useEffect } from 'react';
import api from './api';

const TransactionManager = () => {
    const [transactions, setTransactions] = useState([]);
    const [filterType, setFilterType] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => { fetchAllTransactions(); }, []);

    const fetchAllTransactions = async () => {
        try {
            const response = await api.get('/api/transactions');
            setTransactions(response.data);
        } catch (err) { console.error("Fetch failed", err); }
    };

    // Filter Logic
    const filteredData = transactions.filter(t => filterType === 'ALL' || t.type === filterType);

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleEdit = (transaction) => {
        const newPrice = prompt("Enter new price:", transaction.price);
        if (newPrice) {
            api.put(`/api/transactions/${transaction.transaction_id}`, { ...transaction, price: newPrice })
               .then(() => fetchAllTransactions());
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Transaction Ledger</h2>
                <select onChange={(e) => setFilterType(e.target.value)}>
                    <option value="ALL">All Types</option>
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                </select>
            </div>

            <table style={tableStyle}>
                <thead>
                    <tr style={{ background: '#f4f4f4' }}>
                        <th>Date</th>
                        <th>Ticker</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map(t => (
                        <tr key={t.transaction_id} style={{ borderBottom: '1px solid #eee' }}>
                            <td>{new Date(t.date).toLocaleDateString()}</td>
                            <td>{t.ticker}</td>
                            <td>{t.type}</td>
                            <td>{t.quantity}</td>
                            <td>₹{t.price}</td>
                            <td>
                                <button onClick={() => handleEdit(t)} style={editBtn}>Edit</button>
                                <button onClick={() => handleDelete(t.transaction_id)} style={delBtn}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                <span style={{ margin: '0 15px' }}>Page {currentPage} of {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
        </div>
    );
};

const editBtn = { marginRight: '5px', backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' };
const delBtn = { backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', textAlign: 'left' };

export default TransactionManager;