import React, { useEffect, useState } from 'react';
import { uiTheme } from '../../theme/uiTheme';
import { TransactionModal } from '../../components/modals/TransactionModal';
import mockOrders from "../../mocks/orders.json";

export const OrderStagingPage = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const API_BASE = import.meta.env.VITE_API_URL || '';

    const fetchOrders = async () => {
        const res = await fetch(`${API_BASE}/api/market/todays-orders`);
        const data = await res.json();
        //setOrders(data.data);
        setOrders(mockOrders.data);
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleSyncClick = (order) => {
        // Map Zerodha fields to your DB schema
        const populatedData = {
            ticker: order.tradingsymbol,
            type: order.transaction_type, // 'BUY' or 'SELL'
            quantity: order.quantity,
            price: order.average_price,
            date: new Date().toISOString().split('T')[0], // Today
            external_id: order.order_id // To prevent double-entry later
        };
        setSelectedOrder(populatedData);
        setIsModalOpen(true);
    };

    const handleSave = async (formData: any) => {
        const isEditing = !!formData.transaction_id;
        const url = isEditing
            ? `${API_BASE}/api/transactions/${formData.transaction_id}`
            : `${API_BASE}/api/transactions`;

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticker: formData.ticker,
                    quantity: parseFloat(formData.quantity),
                    price: parseFloat(formData.price),
                    date: formData.date,
                    type: formData.type,
                    parent_buy_id: formData.parent_buy_id,
                    external_id: formData.external_id // To prevent double-entry later
                }),
            });

            if (response.ok) {
                setIsModalOpen(false);
                setSelectedOrder(null);
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to save'}`);
            }
        } catch (err) {
            console.error("Save Error:", err);
            alert("Network error. Check your connection.");
        }
    };

    return (
        <div className={uiTheme.layout.container}>
            <h1 className={uiTheme.text.h1}>Zerodha Order Inbox</h1>
            <p className="mb-6 text-sm font-bold text-gray-500 italic">Orders placed today on Kite. Review and commit to Ledger.</p>

            <div className={uiTheme.table.wrapper}>
                <table className={uiTheme.table.base}>
                    <thead>
                        <tr className={uiTheme.table.th}>
                            <th className="p-4 text-left">Ticker</th>
                            <th className="p-4 text-left">Type</th>
                            <th className="p-4 text-left">Qty</th>
                            <th className="p-4 text-left">Avg. Price</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.order_id} className={uiTheme.table.row}>
                                <td className={uiTheme.table.td + " font-black"}>{order.tradingsymbol}</td>
                                <td className={uiTheme.table.td}>
                                    <span className={`px-2 py-0.5 font-black text-[10px] border-2 border-black ${order.transaction_type === 'BUY' ? 'bg-blue-100' : 'bg-red-100'
                                        }`}>
                                        {order.transaction_type}
                                    </span>
                                </td>
                                <td className={uiTheme.table.td}>{order.quantity}</td>
                                <td className={uiTheme.table.td}>₹{order.average_price}</td>
                                <td className={uiTheme.table.td + " text-center"}>
                                    <button
                                        onClick={() => handleSyncClick(order)}
                                        className="bg-black text-white px-4 py-1 text-xs font-black uppercase hover:bg-yellow-400 hover:text-black transition-colors"
                                    >
                                        Sync to DB
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <TransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialData={selectedOrder} // Pass the Zerodha data here
                    mode="sync"
                    onSave={handleSave}
                />
            )}
        </div>
    );
};