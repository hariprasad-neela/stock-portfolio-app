import React, { useEffect, useState } from 'react';
import { uiTheme } from '../../theme/uiTheme';
import { TransactionModal } from '../../components/modals/TransactionModal';
import mockOrders from "../../mocks/orders.json";

export const OrderStagingPage = () => {
    const API_BASE = import.meta.env.VITE_API_URL || '';

    const [zerodhaOrders, setZerodhaOrders] = useState([]);
    const [syncMap, setSyncMap] = useState<Record<string, { quantity: number, lots: number }>>({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // 1. Fetch logic for both Zerodha and our DB Status
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch fresh orders from Zerodha
            const orderRes = await fetch('/api/zerodha/todays-orders');
            const orders = await orderRes.json();

            // Fetch our sync status map (The API we just created)
            const syncRes = await fetch('/api/transactions/synced-status');
            const syncData = await syncRes.json();

            setZerodhaOrders(orders);
            setSyncMap(syncData);
        } catch (err) {
            console.error("Data fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Invocation on component mount
    useEffect(() => {
        fetchData();
    }, []);

    // 3. Logic to calculate what is left to sync
    const getOrderRemainder = (orderId: string, totalQty: number) => {
        const synced = syncMap[orderId]?.quantity || 0;
        const remaining = totalQty - synced;
        return {
            remaining,
            synced,
            isFullySynced: remaining <= 0,
            lotCount: syncMap[orderId]?.lots || 0
        };
    };

    const handleSyncClick = (order: any) => {
        const { remaining } = getOrderRemainder(order.order_id, order.quantity);

        // Population logic with remaining quantity and external_id
        setSelectedOrder({
            ticker: order.tradingsymbol,
            type: order.transaction_type,
            quantity: remaining, // Suggest the remainder
            price: order.average_price,
            date: order.order_timestamp.split(' ')[0],
            external_id: order.order_id
        });
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

    if (loading) return <div className="p-10 font-black">FETCHING ZERODHA INBOX...</div>;

    return (
        <div className={uiTheme.layout.container}>
            <h1 className={uiTheme.text.h1}>Zerodha Order Inbox</h1>

            <div className={uiTheme.table.wrapper}>
                <table className={uiTheme.table.base}>
                    <thead>
                        <tr className={uiTheme.table.th}>
                            <th className="p-4 text-left">Ticker</th>
                            <th className="p-4 text-left">Order Details</th>
                            <th className="p-4 text-left">Sync Progress</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {zerodhaOrders.map((order: any) => {
                            // 4. Invocation of the remainder logic for each row
                            const { remaining, synced, isFullySynced, lotCount } = getOrderRemainder(order.order_id, order.quantity);

                            return (
                                <tr key={order.order_id} className={`${uiTheme.table.row} ${isFullySynced ? 'bg-gray-50 opacity-60' : ''}`}>
                                    <td className={uiTheme.table.td + " font-black"}>{order.tradingsymbol}</td>
                                    <td className={uiTheme.table.td}>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold uppercase">{order.transaction_type} @ ₹{order.average_price}</span>
                                            <span className="text-[10px] text-gray-400">ID: {order.order_id}</span>
                                        </div>
                                    </td>
                                    <td className={uiTheme.table.td}>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{synced} / {order.quantity} Units</span>
                                            {lotCount > 0 && (
                                                <span className="text-[9px] font-black text-blue-600 uppercase italic">
                                                    Split into {lotCount} lots (₹5k each)
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={uiTheme.table.td + " text-center"}>
                                        {!isFullySynced ? (
                                            <button
                                                onClick={() => handleSyncClick(order)}
                                                className={uiTheme.button.primary + " py-1 px-4 text-xs"}
                                            >
                                                {synced > 0 ? 'Sync Next Lot' : 'Sync to DB'}
                                            </button>
                                        ) : (
                                            <span className="text-green-600 font-black text-xs uppercase italic">✓ Fully Ledgered</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <TransactionModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        fetchData(); // 5. Refresh data after modal closes to update syncMap
                    }}
                    initialData={selectedOrder} // Pass the Zerodha data here
                    mode="sync"
                    onSave={handleSave}
                />
            )}
        </div>
    );
};