// server/strategyRoutes.js
const express = require('express');
const pool = require('./db');
const router = express.Router();

// Placeholder Portfolio ID (This remains hardcoded for now until we implement user authentication)
const PORTFOLIO_ID = '75d19a27-a0e2-4f19-b223-9c86b16e133e'; 

// -------------------------------------------------------------
// GET /api/strategy/open-inventory/:ticker
// Fetches unclosed BUY lots (where is_open = TRUE) and calculates running ABP
// -------------------------------------------------------------
router.get('/open-inventory/:ticker', async (req, res) => {
    const targetTicker = req.params.ticker.toUpperCase(); 

    try {
        // SIMPLIFIED QUERY: Filter by type = 'BUY' and is_open = TRUE
        const openInventoryQuery = `
            SELECT 
                t.transaction_id,
                t.date,
                t.quantity AS buy_quantity,
                t.price AS buy_price
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.portfolio_id = $1 
            AND s.ticker = $2
            AND t.type = 'BUY'
            AND t.is_open = TRUE -- Filter for transactions that are still open
            ORDER BY t.date ASC, t.transaction_id ASC; -- Crucial for correct running ABP
        `;
        
        const result = await pool.query(openInventoryQuery, [PORTFOLIO_ID, targetTicker]);
        let cumulativeUnits = 0;
        let cumulativeCost = 0;

        // 2. Client-side calculation of Running ABP and formatting
        const openLots = result.rows.map(row => {
            const openQuantity = parseFloat(row.buy_quantity); // Full quantity is open
            const buyPrice = parseFloat(row.buy_price);

            // Calculate Running ABP
            cumulativeUnits += openQuantity;
            cumulativeCost += (openQuantity * buyPrice);
            const runningABP = cumulativeUnits > 0 ? cumulativeCost / cumulativeUnits : 0;

            return {
                transaction_id: row.transaction_id,
                date: new Date(row.date).toLocaleDateString('en-IN', { timeZone: 'UTC' }),
                open_quantity: openQuantity, // Renamed from buy_quantity for clarity
                buy_price: buyPrice,
                running_abp: runningABP,
                current_profit: 0, 
                should_sell: false 
            };
        });

        res.json(openLots);

    } catch (error) {
        // ... error handling remains the same ...
        console.error(`Error fetching open inventory for ${targetTicker}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch open inventory.' });
    }
});

module.exports = router;