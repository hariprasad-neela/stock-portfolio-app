// client/src/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import api from './api';
import { SUPPORTED_STOCKS } from './constants';

const TransactionForm = ({ editData, bulkSellData, onClose }) => {
    const initialState = {
        ticker: 'SILVERBEES',
        type: 'BUY',
        quantity: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        is_open: true
    };

    const inputStyle = "w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
    const labelStyle = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1";

    const [formData, setFormData] = useState(initialState);

    // Populate form if we are in Edit mode
    useEffect(() => {
        // If we are editing an existing transaction
        if (editData) {
            setFormData({
                ...editData,
                date: editData.date.split('T')[0]
            });
        }
        // If we are doing a "Bulk Sell" from the Dashboard
        else if (bulkSellData) {
            setFormData({
                ticker: bulkSellData.ticker,
                type: 'SELL',
                quantity: bulkSellData.quantity,
                price: '', // User will enter this
                date: new Date().toISOString().split('T')[0],
                is_open: false // A sell transaction isn't an "open lot"
            });
        }
    }, [editData, bulkSellData]); // Run this whenever these props change

    useEffect(() => {
        if (bulkSellData) {
            setFormData({
                ticker: bulkSellData.ticker,
                type: 'SELL',
                quantity: bulkSellData.quantity,
                price: '',
                date: new Date().toISOString().split('T')[0],
                is_open: false
            });
        }
    }, [bulkSellData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (bulkSellData) {
                // New Bulk Sell Endpoint
                await api.post('/api/transactions/bulk-sell', {
                    ...formData,
                    selectedBuyIds: bulkSellData.selectedBuyIds
                });
            } else if (editData) {
                await api.put(`/api/transactions/${editData.transaction_id}`, formData);
            } else {
                await api.post('/api/transactions', formData);
            }
            onClose();
            // Refresh your data here...
        } catch (err) {
            console.error("Form submission error:", err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                {/* Asset Selection */}
                <div className="md:col-span-2">
                    <label className={labelStyle}>Trading Asset</label>
                    <select className={inputStyle} value={formData.ticker} onChange={e => setFormData({ ...formData, ticker: e.target.value })}>
                        {SUPPORTED_STOCKS.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker}</option>)}
                    </select>
                </div>

                {/* Type Toggle (BUY/SELL) */}
                <div className="md:col-span-2">
                    <label className={labelStyle}>Action Type</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                        {['BUY', 'SELL'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={`py-2 text-xs font-black rounded-xl transition-all ${formData.type === type
                                    ? 'bg-white shadow-sm text-blue-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quantity and Price */}
                <div className="space-y-1">
                    <label className={labelStyle}>Quantity</label>
                    <input type="number" step="any" className={inputStyle} value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                </div>

                <div className="space-y-1">
                    <label className={labelStyle}>Price per Unit</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                        <input type="number" step="any" className={`${inputStyle} pl-8`} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                    </div>
                </div>

                {/* Date and Status */}
                <div className="space-y-1">
                    <label className={labelStyle}>Transaction Date</label>
                    <input type="date" className={inputStyle} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                </div>

                {formData.type === 'BUY' && (
                    <div className="flex items-center gap-3 pt-6 px-1">
                        <input
                            type="checkbox"
                            id="is_open_check"
                            className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={formData.is_open}
                            onChange={e => setFormData({ ...formData, is_open: e.target.checked })}
                        />
                        <label htmlFor="is_open_check" className="text-sm font-bold text-slate-600 cursor-pointer select-none">Mark as Open Lot</label>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-slate-50">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-3xl hover:bg-slate-200 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                    {editData ? 'Update Position' : 'Execute Entry'}
                </button>
            </div>
        </form>
    );
};

const formStyle = { padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const saveBtn = { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' };
const cancelBtn = { backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px' };

export default TransactionForm;