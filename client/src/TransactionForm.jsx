// client/src/TransactionForm.jsx
import React, { useState } from 'react';
import api from './api';

const TransactionForm = ({onTransactionAdded}) => {
    const initialFormState = {
        ticker: '',
        type: 'BUY', // Default to BUY
        date: new Date().toISOString().split('T')[0], // Default to today's date
        quantity: '',
        price: ''
    };

    // Inside TransactionForm.jsx handleSubmit:
    try {
        await api.post('/api/transactions', formData);
        if (onTransactionAdded) onTransactionAdded(); // Closes form and triggers refresh
    } catch (error) { console.log("Error occured in Transaction Form: ", error) }

    const [formData, setFormData] = useState(initialFormState);
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Saving transaction...');

        // Basic client-side validation
        if (!formData.ticker || !formData.quantity || !formData.price || !formData.date) {
            setStatus('Error: Please fill in all fields.');
            return;
        }

        try {
            // Send the data to the backend POST route
            const response = await api.post('/api/transactions', formData);
            
            setStatus(`✅ Success! Transaction saved: ${formData.ticker} (${formData.quantity} shares)`);
            setFormData(initialFormState); // Clear form on success

        } catch (error) {
            console.error('API Error:', error.response ? error.response.data : error.message);
            setStatus(`❌ Error saving transaction: ${error.response?.data?.error || 'Check server logs.'}`);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h3>Add New Transaction</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Ticker (e.g., RELIANCE.NSE)</label>
                    <input
                        type="text"
                        name="ticker"
                        value={formData.ticker}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                    </select>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="0.001"
                        step="any"
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Price per Share (INR)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0.01"
                        step="any"
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Record Transaction
                </button>
            </form>

            {status && (
                <p style={{ marginTop: '15px', padding: '10px', border: status.startsWith('✅') ? '1px solid green' : '1px solid red', borderRadius: '5px', backgroundColor: status.startsWith('✅') ? '#e6ffe6' : '#ffe6e6' }}>
                    {status}
                </p>
            )}
        </div>
    );
};

export default TransactionForm;
