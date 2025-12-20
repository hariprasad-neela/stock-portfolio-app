// client/src/TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api';
import { SUPPORTED_STOCKS } from '../constants';
import { closeModal } from '../store/slices/uiSlice';

const TransactionForm = ({ onClose }) => {
    const dispatch = useDispatch();
    const { modalMode, editData, bulkSellData } = useSelector((state) => state.ui);
    // Initialize state based on the mode
    const [formData, setFormData] = useState({
        ticker: bulkSellData?.ticker || editData?.ticker || 'SILVERBEES',
        type: bulkSellData ? 'SELL' : (editData?.type || 'BUY'),
        quantity: bulkSellData?.quantity || editData?.quantity || '',
        price: editData?.price || '',
        date: new Date().toISOString().split('T')[0]
    });

    // Assume you've fetched your stock list into Redux
    const { stocksList } = useSelector(state => state.portfolio);

    const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400";
    const labelClass = "block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

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
    // Now you can use modalMode to change the UI title
    const title = modalMode === 'BULK_SELL' ? 'Execute Bulk Exit' :
        modalMode === 'EDIT' ? 'Edit Transaction' : 'New Entry';

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
        // Simple validation
        if (!formData.stock_id || !formData.quantity || !formData.price) {
            return alert("Please fill all fields");
        }
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
            // Refresh the current view data
            dispatch(fetchPortfolioOverview());
            dispatch(fetchLedger({ page: 1, limit: 10 }));
        } catch (err) {
            console.error("Form submission error:", err);
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Record Trade</h2>
                <button
                    onClick={() => dispatch(closeModal())}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

                    {/* Ticker Input */}
                    <div className="md:col-span-2">
                        <label className={labelClass}>Trading Asset</label>
                        <select 
                            className={inputClass}
                            value={formData.stock_id}
                            onChange={(e) => setFormData({...formData, stock_id: e.target.value})}
                        >
                            <option value="">Select Stock...</option>
                            {stocksList.map(stock => (
                                <option key={stock.stock_id} value={stock.stock_id}>{stock.ticker}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type Toggle (BUY/SELL) */}
                    <div className="md:col-span-2">
                        <label className={labelClass}>Action Type</label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                            {['BUY', 'SELL'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${formData.type === type
                                        ? 'bg-white text-emerald-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity and Price */}
                    <div className="space-y-1">
                        <label className={labelClass}>Quantity</label>
                        <input type="number" step="any" className={inputClass} value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                    </div>

                    <div className="space-y-1">
                        <label className={labelClass}>Price</label>
                        <input 
                            type="number" 
                            className={inputClass} 
                            placeholder="0.00"
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                        />
                    </div>

                    {/* Date and Status */}
                    <div className="space-y-1">
                        <label className={labelClass}>Transaction Date</label>
                        <input type="date" className={inputClass} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
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
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 mt-4"
                    >
                        {editData ? 'Update Position' : 'Execute Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const formStyle = { padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff' };
const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const saveBtn = { backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' };
const cancelBtn = { backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px' };

export default TransactionForm;