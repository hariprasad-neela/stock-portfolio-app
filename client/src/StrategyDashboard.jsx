// client/src/StrategyDashboard.jsx (MODIFIED)
import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import StrategyCalculator from './StrategyCalculator'; // <-- Import the calculator
import OpenInventoryTracker from './OpenInventoryTracker';

// List of ETFs you are tracking with this strategy
const SUPPORTED_ETFS = ['SILVERBEES', 'GOLDETFS', 'NIFTYBEES'];

const StrategyDashboard = () => {
    // ... (State variables remain the same) ...
    const [selectedTicker, setSelectedTicker] = useState(SUPPORTED_ETFS[0]);
    const [openLots, setOpenLots] = useState([]); // Array state for the response data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NEW State to hold the metrics derived from the openLots array
    const [calculatedMetrics, setCalculatedMetrics] = useState({
        units_held: 0, average_buy_price: 0, capital_deployed: 0, realized_profit: 0
    });

    const { units_held, average_buy_price, capital_deployed, realized_profit } = calculatedMetrics;
    const isPositive = realized_profit >= 0;

    const fetchInventoryAndCalculateMetrics = useCallback(async (ticker) => {
        if (!ticker) return;
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch the Array of open lots
            const response = await api.get(`/api/strategy/open-inventory/${ticker}`);
            const lots = response.data; // This is the Array: [ { transaction_id: "...", ... } ]
            
            // 2. Calculate Metrics from the Array (as per the new requirements)
            let totalUnits = 0;
            let totalCost = 0;
            
            lots.forEach(lot => {
                // Ensure numerical safety
                const quantity = parseFloat(lot.open_quantity) || 0;
                const price = parseFloat(lot.buy_price) || 0;
                totalUnits += quantity;
                totalCost += (quantity * price);
            });
            
            const calculatedABP = totalUnits > 0 ? totalCost / totalUnits : 0;
            
            // 3. Update all states
            setOpenLots(lots);
            setCalculatedMetrics({
                units_held: totalUnits,
                average_buy_price: calculatedABP,
                capital_deployed: totalCost,
                realized_profit: 0 // Placeholder until LIFO is implemented
            });
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching inventory:', err);
            // The catch block executes if anything inside try fails, including a JavaScript crash
            setError(`Could not load data for ${ticker}. Check backend logs.`); 
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedTicker) {
            fetchInventoryAndCalculateMetrics(selectedTicker);
        }
    }, [selectedTicker, fetchInventoryAndCalculateMetrics]);

    // ... (Loading/Error handling remains the same) ...
    if (loading) return <p>Loading strategy status for {selectedTicker}...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
    if (!statusData) return <p>Select an ETF to view status.</p>;

    // ... (formatCurrency and isPositive helpers remain the same) ...
    const formatCurrency = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '₹0.00';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Ticker Selection Dropdown */}
                <label style={{ fontWeight: 'bold' }}>Select Strategy Asset:</label>
                <select
                    value={selectedTicker}
                    onChange={(e) => setSelectedTicker(e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    {SUPPORTED_ETFS.map(ticker => (
                        <option key={ticker} value={ticker}>{ticker}</option>
                    ))}
                </select>
            </div>
            {/* 2. Loading and Error Handling (CONDITIONAL) */}
            {loading && <p>Loading strategy status for {selectedTicker}...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {/* 3. Main Dashboard Content (CONDITIONAL: Render only if not loading and no error) */}
            {/* Use calculatedMetrics.units_held > 0 or a similar check */}
            {!loading && !error && units_held >= 0 && ( // units_held is 0 or > 0 on success
                <>
                    <h3>Strategy Status: {selectedTicker}</h3>

                    {/* Strategy Metric Cards (Same as before) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '15px' }}>

                        {/* 1. UNITS HELD */}
                        <div style={cardStyle}>
                            <p style={labelStyle}>Inventory Units</p>
                            <p style={valueStyle}>{units_held}</p>
                        </div>

                        {/* 2. AVERAGE BUYING PRICE (ABP) */}
                        <div style={cardStyle}>
                            <p style={labelStyle}>Avg. Buy Price (ABP)</p>
                            <p style={valueStyle}>{formatCurrency(average_buy_price)}</p>
                        </div>

                        {/* 3. CAPITAL DEPLOYED (Drawdown) */}
                        <div style={cardStyle}>
                            <p style={labelStyle}>Capital Deployed</p>
                            <p style={valueStyle}>{formatCurrency(capital_deployed)}</p>
                            <small>Max: ₹1,00,000</small>
                        </div>

                        {/* 4. REALIZED P/L */}
                        <div style={cardStyle}>
                            <p style={labelStyle}>Realized Profit</p>
                            <p style={{ ...valueStyle, color: isPositive ? '#16a085' : '#c0392b' }}>
                                {formatCurrency(realized_profit)}
                            </p>
                        </div>
                    </div>

                    {/* ⬇️ NEW: Embed the Strategy Calculator ⬇️ */}
                    <StrategyCalculator
                        currentABP={average_buy_price}
                        unitsHeld={units_held}
                        selectedTicker={selectedTicker}
                    />

                    {/* Open Inventory Tracker */}
                    <OpenInventoryTracker ticker={selectedTicker} openLots={openLots} />
                </>
            )}

            {/* If statusData is NULL but not loading/error (i.e., initial load success) */}
            {!loading && !error && !statusData && (
                <p>No strategy metrics found for {selectedTicker}. Start by adding a BUY transaction.</p>
            )}


        </div>
    );
};

// Simple inline styles for dashboard clarity
const cardStyle = {
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: 'white'
};

const labelStyle = {
    margin: 0,
    fontSize: '0.9em',
    color: '#555'
};

const valueStyle = {
    margin: '5px 0 0 0',
    fontSize: '1.5em',
    fontWeight: 'bold'
};

export default StrategyDashboard;