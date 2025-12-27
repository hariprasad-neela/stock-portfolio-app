import React, { useState, useEffect } from 'react';

export const TransactionModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        ticker: '',
        quantity: '',
        price: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Sync state when modal opens for editing
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                ticker: '',
                quantity: '',
                price: '',
                date: new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white border-4 border-black p-8 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black uppercase mb-6 italic">
                    {initialData ? 'Edit Trade' : 'Add New Trade'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block font-black uppercase text-xs">Ticker</label>
                        <input
                            type="text"
                            className="w-full border-2 border-black p-2 font-bold uppercase focus:bg-yellow-50 outline-none"
                            value={formData.ticker}
                            onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-black uppercase text-xs">Quantity</label>
                            <input
                                type="number"
                                className="w-full border-2 border-black p-2 font-bold outline-none"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block font-black uppercase text-xs">Price</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full border-2 border-black p-2 font-bold outline-none"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-black uppercase text-xs">Date</label>
                        <input
                            type="date"
                            className="w-full border-2 border-black p-2 font-bold outline-none"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => onSave(formData)}
                        className="flex-1 bg-black text-white p-3 font-black uppercase hover:bg-yellow-400 hover:text-black transition-colors"
                    >
                        Save Transaction
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 border-2 border-black p-3 font-black uppercase hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};