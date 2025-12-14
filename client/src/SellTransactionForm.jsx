// client/src/SellTransactionForm.jsx
import React, { useState } from 'react';
import api from './api';

const SellTransactionForm = ({ ticker, selectedLots, cumulativeQuantity, onSellSuccess }) => {
    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        price: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [status, setStatus] = useState('');
    const isDisabled = selectedLots.length === 0;

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Processing SELL transaction...');

        if (isDisabled || !formData.price || !formData.date) {
            setStatus('Error: Please select lots and enter a valid price/date.');
            return;
        }
        
        const sellData = {
            ticker: ticker,
            type: 'SELL',
            date: formData.date,
            quantity: cumulativeQuantity, // Total quantity of selected lots
            price: formData.price,
            closed_lots_ids: selectedLots // Pass the IDs selected by the user
        };

        try {
            const response = await api.post('/api/transactions', sellData);
            
            setStatus(`✅ Success! ${sellData.quantity} shares of ${ticker} sold.`);
            setFormData(initialFormState);
            onSellSuccess(response.data.transaction); // Notify parent to refresh data

        } catch (error) {
            console.error('API Error:', error.response ? error.response.data : error.message);
            setStatus(`❌ Error saving SELL: ${error.response?.data?.error || 'Check server logs.'}`);
        }
    };

    return (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #c0392b', borderRadius: '8px', backgroundColor: '#fdf3f3' }}>
            <h4>Execute SELL</h4>
            <form onSubmit={handleSubmit}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                    Total Units to Sell: <span style={{ color: '#c0392b' }}>{cumulativeQuantity.toFixed(3)}</span>
                </p>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        style={{ padding: '8px' }}
                    />
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Sale Price"
                        min="0.01"
                        step="any"
                        required
                        style={{ padding: '8px' }}
                    />
                </div>
                
                <button type="submit" disabled={isDisabled} style={{ padding: '10px 20px', backgroundColor: isDisabled ? '#999' : '#c0392b', color: 'white', border: 'none', borderRadius: '5px', cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
                    Record Sale & Close Lots ({selectedLots.length})
                </button>
            </form>

            {status && (
                <p style={{ marginTop: '10px', fontSize: '0.9em', color: status.startsWith('✅') ? 'green' : 'red' }}>
                    {status}
                </p>
            )}
        </div>
    );
};

export default SellTransactionForm;