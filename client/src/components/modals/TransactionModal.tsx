import React, { useState, useEffect, useMemo } from 'react';
import { uiTheme } from '../../theme/uiTheme';
import { fetchTradeById } from '../../store/slices/tradesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { formatDate } from '../../utils';

export const TransactionModal = ({ isOpen, onClose, onSave, initialData, mode }) => {
    const dispatch = useDispatch();
    const { openTrades } = useSelector((state: any) => state.trades);
    const stocks = useSelector((state: any) => state.stocks.list);
    const [parentLot, setParentLot] = useState<any>(null);
    const defaultValue = {
        type: 'BUY',
        ticker: '',
        price: 0,
        quantity: 0,
        date: new Date().toISOString().split('T')[0]
    };
    const [formData, setFormData] = useState(defaultValue);

    const handleConfirm = () => {
        const payload = {
            // Include ID if it exists (crucial for updating!)
            transaction_id: formData.transaction_id || null,
            ticker: formData.ticker,
            quantity: Number(formData.quantity),
            price: Number(formData.price),
            date: formData.date,
            type: formData.type,
            parent_buy_id: formData.type === 'SELL' ? formData.parent_buy_id : null,
            external_id: formData.external_id // To prevent double-entry later
        };
        onSave(payload);
    };

    // If editing a SELL, fetch the currently linked BUY lot
    useEffect(() => {
        if (mode === 'edit' && initialData?.parent_buy_id) {
            dispatch(fetchTradeById(initialData.parent_buy_id))
                .unwrap()
                .then((data) => setParentLot(data));
        }
    }, [mode, initialData, dispatch]);

    // Combine Open Trades + The Current Parent Lot (Synthetic List)
    const lotOptions = useMemo(() => {
        const filteredOpen = openTrades.filter(t => t.ticker === formData.ticker);

        // Inject the parent lot if it's not already in the openTrades list
        if (parentLot && !filteredOpen.find(t => t.transaction_id === parentLot.transaction_id)) {
            return [parentLot, ...filteredOpen];
        }
        return filteredOpen;
    }, [openTrades, formData.ticker, parentLot]);

    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData?.parent_buy_id) {
            // 1. First set the form with the SELL data we have
            setFormData(initialData);

            // 2. Fetch the Parent BUY lot details to fill the dropdown 
            // and confirm the quantity matches
            dispatch(fetchTradeById(initialData.parent_buy_id))
                .unwrap()
                .then((buyLot) => {
                    setParentLot(buyLot);
                    // Ensure the quantity is synced in case of any data drift
                    setFormData(prev => ({ ...prev, quantity: buyLot.quantity }));
                });
        } else if (isOpen && (mode === 'edit' || mode === 'sync')) {
            setFormData(initialData);
        } else if (isOpen && mode === 'add') {
            setFormData(defaultValue);
        }
    }, [isOpen, initialData, mode, dispatch]);

    const handleParentLotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;

        // 1. Find the actual lot object from your options list
        const selectedLot = lotOptions.find(lot => lot.transaction_id === selectedId);

        setFormData(prev => ({
            ...prev,
            parent_buy_id: selectedId,
            // 2. Automatically populate the quantity from the selected BUY lot
            quantity: selectedLot ? selectedLot.quantity : prev.quantity,

            // Optional: You could also calculate a "Target Sell Price" 
            // here based on your +3% strategy rule
            // price: selectedLot ? selectedLot.price * 1.03 : prev.price
        }));
    };

    if (!isOpen) return null;

    return (<div className={uiTheme.modal.overlay}>
        <div className={uiTheme.modal.container}>
            {/* Sticky Header */}
            <div className={uiTheme.modal.header}>
                <h2 className={uiTheme.text.h2}>{mode === 'edit' ? 'EDIT' : 'NEW'} TRANSACTION</h2>
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
                            {stocks.map(t => <option key={t.ticker} value={t.ticker}>{t.ticker}</option>)}
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
                        <div>
                            <label className={uiTheme.form.label}>Link to Buy Lot (Parent)</label>
                            <select
                                className={uiTheme.form.select}
                                value={formData.parent_buy_id || ''}
                                onChange={handleParentLotChange}
                            >
                                <option value="">Select a Lot...</option>
                                {lotOptions.map(lot => (
                                    <option key={lot.transaction_id} value={lot.transaction_id}>
                                        {lot.transaction_id === initialData?.parent_buy_id ? '✓ CURRENT: ' : ''}
                                        {formatDate(lot.date)} | ₹{lot.price} | Qty: {lot.quantity}
                                    </option>
                                ))}
                            </select>
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