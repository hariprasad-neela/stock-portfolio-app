// client/src/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import api from './api';

const TransactionForm = ({ editData, onClose }) => {
    const initialState = {
        ticker: 'SILVERBEES',
        type: 'BUY',
        quantity: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        is_open: true
    };

    const [formData, setFormData] = useState(initialState);

    // Populate form if we are in Edit mode
    useEffect(() => {
        if (editData) {
            setFormData({
                ...editData,
                date: new Date(editData.date).toISOString().split('T')[0]
            });
        } else {
            setFormData(initialState);
        }
    }, [editData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editData) {
                await api.put(`/api/transactions/${editData.transaction_id}`, formData);
            } else {
                await api.post('/api/transactions', formData);
            }
            onClose(); // Refreshes and hides
        } catch (err) { alert(err.message); }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <h3>{editData ? 'Edit Transaction' : 'Add New Transaction'}</h3>
            <div style={gridStyle}>
                <label>Ticker:
                    <select value={formData.ticker} onChange={e => setFormData({...formData, ticker: e.target.value})}>
                        <option value="SILVERBEES">SILVERBEES</option>
                        <option value="GOLDETFS">GOLDETFS</option>
                        <option value="NIFTYBEES">NIFTYBEES</option>
                    </select>
                </label>
                
                <label>Type:
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                    </select>
                </label>

                <label>Quantity: 
                    <input type="number" step="any" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required />
                </label>

                <label>Price: 
                    <input type="number" step="any" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </label>

                <label>Date: 
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                </label>

                {formData.type === 'BUY' && (
                    <label>
                        <input type="checkbox" checked={formData.is_open} onChange={e => setFormData({...formData, is_open: e.target.checked})} />
                        Is Open Lot?
                    </label>
                )}
            </div>
            <div style={{ marginTop: '15px' }}>
                <button type="submit">Save</button>
                <button type="button" onClick={onClose}>Cancel</button>
            </div>
        </form>
    );
};

const formStyle = { padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const saveBtn = { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' };
const cancelBtn = { backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px' };

export default TransactionForm;