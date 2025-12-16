// client/src/OpenInventoryTracker.jsx
import React, { useState, useMemo } from 'react';
import SellTransactionForm from './SellTransactionForm';

const MIN_PROFIT_PERCENTAGE = 3; // Feature 5: 3% threshold

const OpenInventoryTracker = ({ ticker, openLots }) => {
    const [currentPrice, setCurrentPrice] = useState(''); // Feature 2: Single price input
    const [selectedLots, setSelectedLots] = useState([]); // Feature 6: Selected lots

    // Helper for INR formatting
    const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(value);

    // --- Calculation Logic (Running ABP and Notional P/L) ---
    const calculatedLots = useMemo(() => {
        const currentPriceNum = parseFloat(currentPrice);
        if (openLots.length === 0) return [];

        let cumulativeUnits = 0;
        let cumulativeCost = 0;

        return openLots.map(lot => {
            const openQuantity = lot.open_quantity;
            const buyPrice = lot.buy_price;

            // Running ABP Calculation (from first open transaction up to that transaction)
            cumulativeUnits += openQuantity;
            cumulativeCost += (openQuantity * buyPrice);
            const runningABP = cumulativeUnits > 0 ? cumulativeCost / cumulativeUnits : 0;

            // Notional Profit (Unrealized P/L)
            const unrealizedPL = currentPriceNum > 0 ? (currentPriceNum - buyPrice) * openQuantity : 0;
            const profitPercentage = (currentPriceNum - buyPrice) / buyPrice * 100;

            // Feature 5: Sell Icon Display
            const shouldSell = profitPercentage >= MIN_PROFIT_PERCENTAGE;

            return {
                ...lot,
                running_abp: runningABP,
                unrealizedPL: unrealizedPL, // Notional Profit
                profitPercentage: profitPercentage,
                shouldSell: shouldSell,
            };
        });
    }, [openLots, currentPrice]);

    // --- Lot Selection Logic (Checkbox and Cumulative P/L) ---
    const handleLotSelection = (id) => {
        setSelectedLots(prev => {
            if (prev.includes(id)) {
                return prev.filter(lotId => lotId !== id);
            }
            return [...prev, id];
        });
    };

    const selectedCalculatedLots = calculatedLots
        .filter(lot => selectedLots.includes(lot.transaction_id));

    const cumulativePL = selectedCalculatedLots
        .reduce((sum, lot) => sum + lot.unrealizedPL, 0);

    const cumulativeQuantity = selectedCalculatedLots
        .reduce((sum, lot) => sum + lot.open_quantity, 0);


    if (openLots.length === 0) {
        return (
            <div style={containerStyle}>
                <h4>Open Inventory Tracker ({ticker})</h4>
                <p>No open buy transactions recorded for **{ticker}** yet. Add a transaction to start tracking!</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h4>Open Inventory Tracker ({ticker})</h4>

            {/* Current Price Input (Required for Notional Profit Calculation) */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Current Price:</label>
                <input
                    type="number"
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(e.target.value)}
                    placeholder="Enter Current Price"
                    min="0.01"
                    step="any"
                    style={{ padding: '5px', width: '150px' }}
                />
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Select</th> {/* Checkbox Column */}
                            <th style={thStyle}>Date</th> {/* Required Column */}
                            <th style={thStyle}>Price</th> {/* Required Column (Buy Price) */}
                            <th style={thStyle}>Quantity</th> {/* Required Column (Open Quantity) */}
                            <th style={thStyle}>Notional Profit</th> {/* Calculated Column */}
                            <th style={thStyle}>Running ABP</th> {/* Calculated Column */}
                            <th style={thStyle}>Action</th> {/* Sell Icon */}
                        </tr>
                    </thead>
                    <tbody>
                        {calculatedLots.map((lot) => (
                            <tr key={lot.transaction_id}>
                                <td style={tdStyleCenter}>
                                    {/* Checkbox Implementation */}
                                    <input
                                        type="checkbox"
                                        checked={selectedLots.includes(lot.transaction_id)}
                                        onChange={() => handleLotSelection(lot.transaction_id)}
                                    />
                                </td>
                                <td style={tdStyle}>{lot.date}</td>
                                <td style={tdStyle}>{formatCurrency(lot.buy_price)}</td>
                                <td style={tdStyle}>{lot.open_quantity.toFixed(3)}</td>

                                {/* Notional Profit Display */}
                                <td style={{ ...tdStyle, color: lot.unrealizedPL >= 0 ? 'green' : 'red' }}>
                                    {formatCurrency(lot.unrealizedPL)} ({lot.profitPercentage.toFixed(2)}%)
                                </td>

                                {/* Running ABP Display */}
                                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{formatCurrency(lot.running_abp)}</td>

                                <td style={tdStyleCenter}>
                                    {lot.shouldSell && (
                                        <span title={`Profit > ${MIN_PROFIT_PERCENTAGE}%`} style={sellIconStyle}>
                                            SELL NOW 🛒
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Cumulative Unrealized P/L Display */}
            <div style={cumulativePLStyle}>
                <span>Selected Lots ({selectedLots.length}): </span>
                <span style={{ color: cumulativePL >= 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                    Cumulative Unrealized P/L: {formatCurrency(cumulativePL)}
                </span>
            </div>

            {/* Sell Transaction Form (Optional: Uncomment if you want to display the form here) */}
            {/* <SellTransactionForm 
                ticker={ticker}
                selectedLots={selectedLots}
                cumulativeQuantity={cumulativeQuantity}
                onSellSuccess={onSellSuccess}
            /> */}

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