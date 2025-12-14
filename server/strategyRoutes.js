// server/strategyRoutes.js
const express = require('express');
const pool = require('./db');
const router = express.Router();

// Placeholder Portfolio ID (This remains hardcoded for now until we implement user authentication)
const PORTFOLIO_ID = '75d19a27-a0e2-4f19-b223-9c86b16e133e'; 

// -------------------------------------------------------------
// GET /api/strategy/status/:ticker
// Calculates the core metrics (ABP, Inventory, Capital) for a specific ETF
// -------------------------------------------------------------
router.get('/status/:ticker', async (req, res) => {
    // 1. Get the ticker from the URL path
    const targetTicker = req.params.ticker.toUpperCase(); 

    try {
        // --- 2. Calculate Inventory and Capital Deployed ---
        // $1 is PORTFOLIO_ID, $2 is targetTicker
        const statusQuery = `
            SELECT
                SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) AS total_units,
                SUM(CASE WHEN t.type = 'BUY' THEN t.quantity * t.price ELSE 0 END) AS total_buy_value,
                SUM(CASE WHEN t.type = 'SELL' THEN t.quantity * t.price ELSE 0 END) AS total_sale_value,
                COALESCE(SUM(CASE WHEN t.type = 'SELL' THEN t.quantity * t.price ELSE 0 END), 0) - 
                COALESCE(SUM(CASE WHEN t.type = 'BUY' THEN t.quantity * t.price ELSE 0 END), 0) AS total_realized_pl
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.portfolio_id = $1 AND s.ticker = $2;
        `;
        
        const statusResult = await pool.query(statusQuery, [PORTFOLIO_ID, targetTicker]);
        const data = statusResult.rows[0];

        // If no transactions exist, result might be null/zero
        const totalUnits = parseFloat(data.total_units) || 0;
        const totalBuyValue = parseFloat(data.total_buy_value) || 0;
        const totalSaleValue = parseFloat(data.total_sale_value) || 0;

        // Calculate Average Buying Price (ABP)
        const avgBuyingPrice = totalUnits > 0 ? (totalBuyValue - totalSaleValue) / totalUnits : 0;
        
        // Calculate Total Capital Deployed (Current Drawdown)
        // This represents the net money currently tied up in the ETF inventory.
        const netCostOfHoldings = totalBuyValue - totalSaleValue;
        
        // Calculate Realized P/L for the dashboard
        // Note: This needs refinement, but serves as a quick metric for now.
        const realizedPL = parseFloat(data.total_realized_pl) || 0;


        res.json({
            ticker: targetTicker,
            units_held: totalUnits,
            average_buy_price: Math.max(0, avgBuyingPrice).toFixed(4), // ABP must be non-negative
            capital_deployed: Math.max(0, netCostOfHoldings).toFixed(2), 
            total_buy_value: totalBuyValue.toFixed(2),
            total_sale_value: totalSaleValue.toFixed(2),
            realized_profit: realizedPL.toFixed(2)
        });

    } catch (error) {
        console.error('Error fetching strategy status:', error.message);
        res.status(500).json({ error: 'Failed to fetch strategy status.' });
    }
});


module.exports = router;