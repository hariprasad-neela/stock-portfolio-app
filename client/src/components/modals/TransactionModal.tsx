import React, { useState, useEffect } from 'react';
import { uiTheme } from '../../theme/uiTheme';

export const TransactionModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [activeTickers, setActiveTickers] = useState<string[]>([]);
    const [openLots, setOpenLots] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        transaction_id: null,
        ticker: '',
        type: 'BUY',
        quantity: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
        parent_buy_id: null // Added to track the 1:1 link
    });

    const API_BASE = import.meta.env.VITE_API_URL || '';

    // ✅ ADD THE FETCH LOGIC FOR OPEN LOTS
    useEffect(() => {
        if (isOpen && formData.type === 'SELL' && formData.ticker) {
            fetch(`${API_BASE}/api/strategy/open-inventory/${formData.ticker}`)
                .then(res => res.json())
                .then(data => setOpenLots(data))
                .catch(err => console.error("Error fetching lots:", err));
        }
    }, [formData.type, formData.ticker, isOpen]);

    // 2. Sync form when initialData changes (for Editing)
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                date: new Date(initialData.date).toISOString().split('T')[0]
            });
        } else {
            setFormData({ ticker: '', type: 'BUY', quantity: '', price: '', date: new Date().toISOString().split('T')[0] });
        }
    }, [initialData, isOpen]);

    // Inside TransactionModal.tsx
    useEffect(() => {
        if (isOpen) {
            const fetchTickers = async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/market/active-tickers`);
                    const data = await res.json();
                    // Backend returns an array of strings like ["GOLDBEES", "SILVERBEES"]
                    setActiveTickers(data);
                } catch (err) {
                    console.error("Error fetching tickers in modal:", err);
                }
            };
            fetchTickers();
        }
    }, [isOpen, API_BASE]);

    const handleConfirm = () => {
        const payload = {
            // Include ID if it exists (crucial for updating!)
            transaction_id: formData.transaction_id || null,
            ticker: formData.ticker,
            quantity: Number(formData.quantity),
            price: Number(formData.price),
            date: formData.date,
            type: formData.type,
            parent_buy_id: formData.type === 'SELL' ? formData.parent_buy_id : null
        };
        onSave(payload);
    };

    if (!isOpen) return null;

    return (<div className={uiTheme.modal.overlay}>
        <div className={uiTheme.modal.container}>
            {/* Sticky Header */}
            <div className={uiTheme.modal.header}>
                <h2 className={uiTheme.text.h2}>Record Trade</h2>
                <button onClick={onClose} className="font-black text-2xl">×</button>
            </div>
            {/* Scrollable Body */}
            <div className={uiTheme.modal.body}>
                <div className={uiTheme.form.grid}>
                    {/* TICKER SELECT */}
                    <div>
                        <label className={uiTheme.form.label}>Asset</label>
                        <select
                            className={uiTheme.form.select}
                            value={formData.ticker}
                            onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                        >
                            <option value="">-- SELECT TICKER --</option>
                            {activeTickers.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {/* BUY/SELL TOGGLE */}
                            <div>
                                <label className={uiTheme.form.label}>Type</label>
                                <div className={uiTheme.form.toggleGroup}>
                                    <button
                                        onClick={() => setFormData({ ...formData, type: 'BUY', parent_buy_id: null, quantity: '' })}
                                        className={formData.type === 'BUY' ? uiTheme.form.toggleBtnActive : uiTheme.form.toggleBtnInactive}>
                                        BUY
                                    </button>
                                    <button
                                        onClick={() => setFormData({ ...formData, type: 'SELL' })}
                                        className={formData.type === 'SELL' ? uiTheme.form.toggleBtnActive : uiTheme.form.toggleBtnInactive}>
                                        SELL
                                    </button>
                                </div>
                            </div>
                            {/* DATE FIELD */}
                            <div>
                                <label className={uiTheme.form.label}>Transaction Date</label>
                                <input
                                    type="date"
                                    className={uiTheme.form.input}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            {/* QUANTITY FIELD */}
                            <div>
                                <label className={uiTheme.form.label}>Quantity (Units)</label>
                                <input
                                    type="number"
                                    className={`${uiTheme.form.input} ${formData.type === 'SELL' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    value={formData.quantity}
                                    onChange={(e) => formData.type === 'BUY' && setFormData({ ...formData, quantity: e.target.value })}
                                    readOnly={formData.type === 'SELL'}
                                    placeholder="Enter units"
                                />
                                {formData.type === 'SELL' && (
                                    <p className="text-[10px] font-black text-blue-600 mt-1 uppercase italic">
                                        * Quantity is locked to matched buy lot
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={uiTheme.form.label}>Execution Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={uiTheme.form.input}
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                    {/* 1:1 LOT SELECTION (Only for SELL) */}
                    {formData.type === 'SELL' && (
                        <div className="space-y-2">
                            <label className={uiTheme.form.label}>Select Parent Buy Lot</label>
                            <div className="max-h-60 overflow-y-auto pr-2 border-2 border-black p-2 bg-gray-50">
                                {openLots.map(lot => (
                                    <div
                                        key={lot.transaction_id}
                                        onClick={() => setFormData({
                                            ...formData,
                                            parent_buy_id: lot.transaction_id,
                                            quantity: lot.quantity, // Correct mapping from your JSON
                                            ticker: formData.ticker // Ensure ticker matches
                                        })}
                                        className={`${uiTheme.list.item} ${formData.parent_buy_id === lot.transaction_id ? uiTheme.list.itemSelected : uiTheme.list.itemUnselected}`}
                                    >
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-black">{lot.date}</span>
                                            <span className="font-bold">{lot.quantity} Units @ ₹{lot.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Footer */}
            <div className={uiTheme.modal.footer}>
                <button onClick={onClose} className={uiTheme.button.secondary + " flex-1"}>Cancel</button>
                <button onClick={handleConfirm} className={uiTheme.button.primary + " flex-1"}>Confirm</button>
            </div>
        </div>
    </div>
    );
};