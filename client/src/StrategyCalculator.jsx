// client/src/StrategyCalculator.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from './api';

const LOT_VALUE = 5000;
const GROSS_PROFIT_TARGET = 180;

const StrategyCalculator = ({ currentABP, unitsHeld, selectedTicker }) => {
    const [prices, setPrices] = useState({
        open: '',
        high: '',
        low: '',
        yesterdaySalePrice: '' // Used for Re-entry Buy Condition
    });
    const [loadingData, setLoadingData] = useState(false);
    const [dataError, setDataError] = useState(null);

    // --- NEW: Data Fetching Hook ---
    const fetchLatestPrices = useCallback(async (ticker) => {
        setLoadingData(true);
        setDataError(null);
        // Reset prices when ticker changes
        setPrices({ open: '', high: '', low: '', yesterdaySalePrice: '' }); 

        if (!ticker || ticker === 'N/A') { 
            setLoadingData(false);
            return;
        }

        try {
            // Call the new backend data route
            const response = await api.get(`/api/data/latest/${ticker}`);
            const { open, high, low } = response.data;

            setPrices(prev => ({ 
                ...prev, 
                open: open, 
                high: high, 
                low: low 
            }));
            setLoadingData(false);

        } catch (error) {
            console.error('Price Fetch Error:', error);
            setDataError(`Failed to fetch live prices for ${ticker}. Check Console.`);
            setLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchLatestPrices(selectedTicker);
    }, [selectedTicker, fetchLatestPrices]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPrices(prev => ({ ...prev, [name]: parseFloat(value) || '' }));
    };

    const { open, high, low, yesterdaySalePrice } = prices;
    const currentABPNum = parseFloat(currentABP);
    const unitsHeldNum = parseFloat(unitsHeld);
    const hasInventory = unitsHeldNum > 0;
    
    // --- CALCULATIONS ---

    // 1. SELL DECISION (Simplified, since full LIFO profit calc is complex)
    // We check if the current High Price *exceeds* the ABP by enough margin to hit the target.
    // We approximate the required profit per unit based on the lot value.
    const profitMarginRequired = GROSS_PROFIT_TARGET / unitsHeldNum;
    const requiredSalePrice = hasInventory ? currentABPNum + profitMarginRequired : 0;
    
    // The actual check is much simpler: check if the most recent lots can hit ₹180 profit.
    // Since we don't have LIFO lot data here, we'll use a pragmatic proxy:
    const potentialGrossProfit = hasInventory 
        ? unitsHeldNum * (high - currentABPNum) 
        : 0;

    const shouldSell = hasInventory && high > currentABPNum && potentialGrossProfit >= GROSS_PROFIT_TARGET;
    
    // 2. BUY DECISION - Averaging Down
    const shouldBuyAvgDown = hasInventory && low < currentABPNum;

    // 3. BUY DECISION - Immediate Re-entry
    const shouldBuyReEntry = !hasInventory && yesterdaySalePrice && low < yesterdaySalePrice;
    
    // Units to buy based on Lot Value / Low Price
    const unitsToBuy = low > 0 ? Math.floor(LOT_VALUE / low) : 0;
    
    // Final Buy Recommendation
    let buyRecommendation = { action: false, reason: '' };
    if (shouldBuyAvgDown) {
        buyRecommendation = { action: true, reason: `Averaging Down (Low ₹${low} < ABP ₹${currentABPNum.toFixed(2)})` };
    } else if (shouldBuyReEntry) {
        buyRecommendation = { action: true, reason: `Immediate Re-entry (Low ₹${low} < Yesterday's Sale Price ₹${yesterdaySalePrice.toFixed(2)})` };
    } else if (!hasInventory) {
        // Initial Buy condition (at Market Open) - Assume market is open when checking
        buyRecommendation = { action: true, reason: `Initial Buy (Execute at Open Price ₹${open})` };
        unitsToBuy = open > 0 ? Math.floor(LOT_VALUE / open) : 0; // Units based on OPEN price for initial buy
    }
    
    // --- DISPLAY RENDER ---

    return (
        <div style={containerStyle}>
            <h4>Strategy Decision Calculator</h4>
            
            {loadingData && <p style={{ color: '#007bff' }}>Fetching latest prices...</p>}
            {dataError && <p style={{ color: 'red' }}>{dataError}</p>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                {/* Inputs now have pre-filled values */}
                <InputField label="Today's Open" name="open" value={open} onChange={handleChange} />
                <InputField label="Today's High" name="high" value={high} onChange={handleChange} />
                <InputField label="Today's Low" name="low" value={low} onChange={handleChange} />
            </div>
            
            <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#555' }}>
                *Optional: Input yesterday's sale price if inventory is zero and re-entry is being considered.
            </p>
            <InputField 
                label="Yesterday's Sale Price" 
                name="yesterdaySalePrice" 
                value={yesterdaySalePrice} 
                onChange={handleChange} 
                isOptional={true} 
            />

            <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
                
                {/* SELL RECOMMENDATION */}
                <h5 style={{ margin: '0 0 10px 0' }}>SELL Recommendation:</h5>
                <div style={decisionBoxStyle(shouldSell)}>
                    {shouldSell 
                        ? (
                            <>
                                <p style={actionStyle(true)}>✅ SELL RECOMMENDED</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>
                                    Target Gross Profit (₹{GROSS_PROFIT_TARGET}) achieved at High Price (₹{high}).
                                    Execute SELL at High Price (₹{high}) to book profit.
                                </p>
                            </>
                        ) 
                        : (
                            <p style={actionStyle(false)}>❌ NO SELL ACTION</p>
                        )}
                    {hasInventory && !shouldSell && <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#888' }}>
                         Potential profit at High: ₹{potentialGrossProfit.toFixed(2)}. Target: ₹{GROSS_PROFIT_TARGET}.
                    </p>}
                </div>

                {/* BUY RECOMMENDATION */}
                <h5 style={{ margin: '20px 0 10px 0' }}>BUY Recommendation:</h5>
                <div style={decisionBoxStyle(buyRecommendation.action)}>
                    {buyRecommendation.action ? (
                        <>
                            <p style={actionStyle(true)}>✅ BUY RECOMMENDED</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em' }}>
                                **Action:** Buy **{unitsToBuy} units** (₹{LOT_VALUE.toLocaleString()}) at Price **₹{buyRecommendation.reason.includes('Initial') ? open : low}**
                                <br/>**Reason:** {buyRecommendation.reason}
                            </p>
                        </>
                    ) : (
                        <p style={actionStyle(false)}>❌ NO BUY ACTION</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-Component for Input Field
const InputField = ({ label, name, value, onChange, isOptional }) => (
    <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>
            {label} {isOptional && <span style={{ color: '#888' }}>(Optional)</span>}
        </label>
        <input
            type="number"
            name={name}
            value={value}
            onChange={onChange}
            placeholder="Price"
            min="0"
            step="any"
            required={!isOptional}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
        />
    </div>
);

// Inline Styles
const containerStyle = {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    marginTop: '20px'
};

const decisionBoxStyle = (isAction) => ({
    padding: '15px',
    borderRadius: '8px',
    backgroundColor: isAction ? '#e6ffe6' : '#ffeeee',
    border: `1px solid ${isAction ? '#4CAF50' : '#c0392b'}`
});

const actionStyle = (isAction) => ({
    margin: 0,
    fontWeight: 'bold',
    color: isAction ? '#1e8449' : '#c0392b'
});

export default StrategyCalculator;