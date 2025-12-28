import React, { useState, useEffect } from 'react';

export const TransactionModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [activeTickers, setActiveTickers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    ticker: '',
    type: 'BUY',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0]
  });

  const API_BASE = import.meta.env.VITE_API_URL || '';

  // 1. Fetch allowed tickers for the dropdown
  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE}/api/market/active-tickers`)
        .then(res => res.json())
        .then(data => setActiveTickers(data))
        .catch(err => console.error("Error loading tickers", err));
    }
  }, [isOpen, API_BASE]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-4 border-black p-8 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-3xl font-black uppercase mb-6 italic tracking-tighter">Manage Trade</h2>
        
        <div className="space-y-5">
          {/* BUY/SELL TOGGLE */}
          <div>
            <label className="block font-black uppercase text-[10px] mb-1">Transaction Type</label>
            <div className="flex border-4 border-black p-1 bg-gray-100">
              {['BUY', 'SELL'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`flex-1 py-2 font-black transition-all ${
                    formData.type === t ? 'bg-black text-white' : 'hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* TICKER DROPDOWN */}
          <div>
            <label className="block font-black uppercase text-[10px] mb-1">Select Asset</label>
            <select 
              className="w-full border-4 border-black p-3 font-black uppercase outline-none focus:bg-yellow-50"
              value={formData.ticker}
              onChange={(e) => setFormData({...formData, ticker: e.target.value})}
            >
              <option value="">-- CHOOSE --</option>
              {activeTickers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* QTY & PRICE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-black uppercase text-[10px] mb-1">Quantity</label>
              <input 
                type="number" 
                className="w-full border-4 border-black p-3 font-bold outline-none"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div>
              <label className="block font-black uppercase text-[10px] mb-1">Price</label>
              <input 
                type="number" step="0.01"
                className="w-full border-4 border-black p-3 font-bold outline-none"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block font-black uppercase text-[10px] mb-1">Date</label>
            <input 
              type="date" 
              className="w-full border-4 border-black p-3 font-bold outline-none"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 bg-black text-white p-4 font-black uppercase hover:bg-yellow-400 hover:text-black transition-all active:translate-y-1"
          >
            Confirm Trade
          </button>
          <button onClick={onClose} className="flex-1 border-4 border-black p-4 font-black uppercase hover:bg-gray-100">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};