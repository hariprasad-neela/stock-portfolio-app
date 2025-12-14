// server/strategyRoutes.js
const express = require('express');
const pool = require('./db');
const router = express.Router();

// Placeholder IDs (must match those used in transactionRoutes.js)
const PORTFOLIO_ID = '75d19a27-a0e2-4f19-b223-9c86b16e133e';
const TARGET_TICKER = 'SILVERBEES'; 

// -------------------------------------------------------------
// GET /api/strategy/status
// Calculates the core metrics (ABP, Inventory, Capital)
// -------------------------------------------------------------
router.get('/status', async (req, res) => {
    try {
        // --- 1. Calculate Inventory and Capital Deployed ---
        const statusQuery = `
            SELECT
                SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) AS total_units,
                SUM(CASE WHEN t.type = 'BUY' THEN t.quantity * t.price ELSE 0 END) AS total_buy_value,
                SUM(CASE WHEN t.type = 'SELL' THEN t.quantity * t.price ELSE 0 END) AS total_sale_value
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.portfolio_id = $1 AND s.ticker = $2;
        `;
        
        const statusResult = await pool.query(statusQuery, [PORTFOLIO_ID, TARGET_TICKER]);
        const data = statusResult.rows[0];

        // Convert results to numbers, default to 0
        const totalUnits = parseFloat(data.total_units) || 0;
        const totalBuyValue = parseFloat(data.total_buy_value) || 0;
        const totalSaleValue = parseFloat(data.total_sale_value) || 0;

        // Calculate Average Buying Price (ABP)
        const avgBuyingPrice = totalUnits > 0 ? (totalBuyValue / totalUnits) : 0;
        
        // Calculate Total Capital Deployed (Drawdown)
        // This is simplified: total cost of shares held minus capital recouped from prior sales.
        const totalCapitalDeployed = totalUnits > 0 ? (totalBuyValue - totalSaleValue) : 0;
        
        // --- 2. Calculate Realized Net Profit ---
        const profitQuery = `
            SELECT SUM(t.quantity * (t.price - t.buy_price)) AS gross_profit
            FROM transactions t
            WHERE t.type = 'SELL' AND t.portfolio_id = $1;
        `;
        // NOTE: We need a complex LIFO calculation for real realized profit, 
        // but for the dashboard, let's start with total capital gain.
        // The current data structure needs a dedicated function to calculate LIFO profit.
        // For now, we will track Total Buy Value and Total Sale Value.

        res.json({
            ticker: TARGET_TICKER,
            units_held: totalUnits,
            average_buy_price: avgBuyingPrice.toFixed(4),
            capital_deployed: Math.max(0, totalCapitalDeployed).toFixed(2), // Cannot be negative
            total_buy_value: totalBuyValue.toFixed(2),
            total_sale_value: totalSaleValue.toFixed(2),
            // Placeholder for Realized Profit (To be calculated accurately later)
            realized_profit_approx: (totalSaleValue - totalBuyValue).toFixed(2)
        });

    } catch (error) {
        console.error('Error fetching strategy status:', error.message);
        res.status(500).json({ error: 'Failed to fetch strategy status.' });
    }
});


module.exports = router;