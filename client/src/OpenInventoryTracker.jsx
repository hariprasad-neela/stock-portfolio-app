// client/src/OpenInventoryTracker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import SellTransactionForm from './SellTransactionForm';

const MIN_PROFIT_PERCENTAGE = 3; // Feature 5: 3% threshold

const OpenInventoryTracker = ({ ticker }) => {
    const [openLots, setOpenLots] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(''); // Feature 2: Single price input
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLots, setSelectedLots] = useState([]); // Feature 6: Selected lots

    // Helper for INR formatting
    const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value);

const fetchOpenLots = useCallback(async (currentTicker) => {
        // ... (existing fetch logic remains) ...
        try {
            // ... (existing fetch logic) ...
            const response = await api.get(`/api/strategy/open-inventory/${currentTicker}`);
            setOpenLots(response.data);
            setSelectedLots([]); 
        } catch (err) {
            // ...
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Function to refresh all data after a successful sale
    const handleSellSuccess = (newTransaction) => {
        // 1. Refresh the open lots list
        fetchOpenLots(ticker); 
        
        // 2. You may also want to trigger a refresh of the StrategyDashboard
        // (This would require passing a callback from App.jsx down to StrategyDashboard)
        // For now, we only refresh the inventory.
    };

    useEffect(() => {
        fetchOpenLots(ticker);
    }, [ticker, fetchOpenLots]);

    // --- Price/Profit Calculation ---
    const currentPriceNum = parseFloat(currentPrice);
    
    // Recalculate lots whenever the price changes
    const calculatedLots = openLots.map(lot => {
        const unrealizedPL = currentPriceNum > 0 ? (currentPriceNum - lot.buy_price) * lot.open_quantity : 0;
        const profitPercentage = (currentPriceNum - lot.buy_price) / lot.buy_price * 100;
        
        // Feature 5: Check 3% profit condition
        const shouldSell = profitPercentage >= MIN_PROFIT_PERCENTAGE;

        return {
            ...lot,
            unrealizedPL: unrealizedPL,
            profitPercentage: profitPercentage,
            shouldSell: shouldSell,
        };
    });

    // Calculate cumulative quantity of selected lots
    const cumulativeQuantity = calculatedLots
        .filter(lot => selectedLots.includes(lot.transaction_id))
        .reduce((sum, lot) => sum + lot.open_quantity, 0);

    // --- Lot Selection Logic (Feature 6) ---
    const handleLotSelection = (id) => {
        setSelectedLots(prev => {
            if (prev.includes(id)) {
                return prev.filter(lotId => lotId !== id);
            }
            return [...prev, id];
        });
    };

    const cumulativePL = calculatedLots
        .filter(lot => selectedLots.includes(lot.transaction_id))
        .reduce((sum, lot) => sum + lot.unrealizedPL, 0);

    if (loading) return <p>Loading open inventory...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

return (
        <div style={containerStyle}>
            {/* ... (Current Price Input and Open Lots Table remain the same) ... */}
            
            {calculatedLots.length > 0 && (
                <>
                    {/* ... (Open Lots Table and Cumulative PL display remain the same) ... */}

                    {/* ⬇️ NEW: Sell Transaction Form ⬇️ */}
                    <SellTransactionForm 
                        ticker={ticker}
                        selectedLots={selectedLots}
                        cumulativeQuantity={cumulativeQuantity}
                        onSellSuccess={handleSellSuccess}
                    />
                </>
            )}
        </div>
    );
};

// ... (containerStyle, tableStyle, thStyle, tdStyle, tdStyleCenter, sellIconStyle, cumulativePLStyle) ...
const containerStyle = {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    marginTop: '20px'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9em',
};

const thStyle = {
    padding: '10px',
    textAlign: 'left',
    borderBottom: '2px solid #333',
    backgroundColor: '#f4f4f4',
    position: 'sticky',
    top: 0,
    zIndex: 1
};

const tdStyle = {
    padding: '8px 10px',
    borderBottom: '1px solid #ddd',
    textAlign: 'left',
};

const tdStyleCenter = {
    ...tdStyle,
    textAlign: 'center',
};

const sellIconStyle = {
    backgroundColor: '#ffeecc',
    color: '#ff9900',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.8em',
};

const cumulativePLStyle = {
    marginTop: '15px',
    padding: '10px',
    borderTop: '1px solid #eee',
    textAlign: 'right',
    fontWeight: 'normal',
    backgroundColor: '#f9f9f9',
};

export default OpenInventoryTracker;