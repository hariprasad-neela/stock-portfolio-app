import React, { useState, useEffect } from 'react';
import { uiTheme } from '../../theme/uiTheme';

export const TransactionModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [activeTickers, setActiveTickers] = useState<string[]>([]);
    const [openLots, setOpenLots] = useState<any[]>([]);
    const [selectedLotIds, setSelectedLotIds] = useState<string[]>([]);
    const [formData, setFormData] = useState({
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

    if (!isOpen) return null;

    return (<div className={uiTheme.modal.overlay}>
        <div className={uiTheme.modal.container}>

            <div className={uiTheme.modal.header}>
                <h2 className={uiTheme.modal.title}>Record Trade</h2>
                <button onClick={onClose} className="font-black hover:text-red-500">CLOSE [X]</button>
            </div>

            <div className="p-6 space-y-6">
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
                                    onClick={() => setFormData({ ...formData, type: 'BUY' })}
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

                        <div>
                            <label className={uiTheme.form.label}>Execution Price</label>
                            <input
                                type="number"
                                step="0.01"
                                className={uiTheme.form.input}
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })} // Fixed: Added onChange
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* 1:1 LOT SELECTION AREA */}
                    {formData.type === 'SELL' && (
                        <div className="space-y-2">
                            <label className={uiTheme.form.label}>Select Parent Buy Lot</label>
                            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {openLots.map(lot => (
                                    <div
                                        key={lot.transaction_id}
                                        onClick={() => setFormData({
                                            ...formData,
                                            parent_buy_id: lot.transaction_id,
                                            // Map open_quantity to quantity and buy_price to price for the Sell entry
                                            quantity: lot.open_quantity,
                                            price: lot.buy_price
                                        })}
                                        className={`${uiTheme.list.item} ${formData.parent_buy_id === lot.transaction_id ? uiTheme.list.itemSelected : uiTheme.list.itemUnselected}`}
                                    >
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex flex-col">
                                                <span className="font-black uppercase">{lot.date}</span> {/* Date is already formatted as 3/10/2024 */}
                                                <span className="opacity-70">Price: ₹{lot.buy_price}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black">{lot.open_quantity}</span>
                                                <span className="block text-[8px] uppercase">Units</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={uiTheme.modal.footer}>
                <button onClick={() => onSave(formData)} className={uiTheme.button.primary}>Confirm</button>
                <button onClick={onClose} className={uiTheme.button.secondary}>Cancel</button>
            </div>
        </div>
    </div>
    );
};