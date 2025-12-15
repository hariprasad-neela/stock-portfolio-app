// server/strategyRoutes.js
const express = require('express');
const pool = require('./db');
const router = express.Router();

// Placeholder Portfolio ID (Make sure this matches your transactions!)
const PORTFOLIO_ID = '75d19a27-a0e2-4f19-b223-9c86b16e133e'; 


// =============================================================
// 1. GET /api/strategy/status/:ticker (REQUIRED BY DASHBOARD)
// Calculates the overall ABP, units held, and total profit/loss.
// =============================================================
router.get('/status/:ticker', async (req, res) => {
    const targetTicker = req.params.ticker.toUpperCase(); 

    // SQL query to calculate strategy metrics (ABP, units, capital, profit)
    const statusQuery = `
        WITH TransactionsData AS (
            SELECT
                t.type,
                t.quantity,
                t.price
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.portfolio_id = $1 AND s.ticker = $2
        ),
        
        BuyData AS (
            SELECT 
                COALESCE(SUM(quantity), 0) AS total_buy_units,
                COALESCE(SUM(quantity * price), 0) AS total_buy_cost
            FROM TransactionsData
            WHERE type = 'BUY'
        ),
        
        SellData AS (
            SELECT
                COALESCE(SUM(quantity), 0) AS total_sell_units,
                COALESCE(SUM(quantity * price), 0) AS total_sell_revenue
            FROM TransactionsData
            WHERE type = 'SELL'
        )
        
        SELECT
            bd.total_buy_units,
            sd.total_sell_units,
            bd.total_buy_cost,
            sd.total_sell_revenue,
            (bd.total_buy_units - sd.total_sell_units) AS units_held
        FROM BuyData bd, SellData sd;
    `;

    try {
        const result = await pool.query(statusQuery, [PORTFOLIO_ID, targetTicker]);
        const data = result.rows[0];
        
        // This handles the case where the ticker exists but has zero transactions
        if (!data || data.total_buy_units === null) {
            return res.json({ 
                units_held: 0, 
                average_buy_price: 0, 
                capital_deployed: 0, 
                realized_profit: 0 
            });
        }

        const units_held = parseFloat(data.units_held);
        const total_buy_cost = parseFloat(data.total_buy_cost);
        const total_sell_revenue = parseFloat(data.total_sell_revenue);
        const total_sell_units = parseFloat(data.total_sell_units);
        const total_buy_units = parseFloat(data.total_buy_units);

        // Calculate metrics
        const average_buy_price = total_buy_units > 0 ? total_buy_cost / total_buy_units : 0;
        const realized_profit = total_sell_revenue - (total_sell_units * average_buy_price);
        const capital_deployed = units_held * average_buy_price;

        res.json({
            units_held: units_held,
            average_buy_price: average_buy_price,
            capital_deployed: capital_deployed,
            realized_profit: realized_profit,
        });

    } catch (error) {
        console.error(`Error calculating strategy status for ${targetTicker}:`, error.message);
        res.status(500).json({ error: 'Failed to calculate strategy status.' });
    }
});


// =============================================================
// 2. GET /api/strategy/open-inventory/:ticker (REQUIRED BY OPEN INVENTORY TRACKER)
// Fetches the specific open BUY lots for the user to select from.
// =============================================================
router.get('/open-inventory/:ticker', async (req, res) => {
    const targetTicker = req.params.ticker.toUpperCase(); 

    try {
        // Query to fetch open BUY transactions (where is_open = TRUE)
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
            AND t.is_open = TRUE
            ORDER BY t.date ASC, t.transaction_id ASC;
        `;
        
        const result = await pool.query(openInventoryQuery, [PORTFOLIO_ID, targetTicker]);
        let cumulativeUnits = 0;
        let cumulativeCost = 0;

        // Client-side calculation of Running ABP 
        const openLots = result.rows.map(row => {
            const openQuantity = parseFloat(row.buy_quantity); 
            const buyPrice = parseFloat(row.buy_price);

            // Calculate Running ABP
            cumulativeUnits += openQuantity;
            cumulativeCost += (openQuantity * buyPrice);
            const runningABP = cumulativeUnits > 0 ? cumulativeCost / cumulativeUnits : 0;

            return {
                transaction_id: row.transaction_id,
                date: new Date(row.date).toLocaleDateString('en-IN', { timeZone: 'UTC' }),
                open_quantity: openQuantity, 
                buy_price: buyPrice,
                running_abp: runningABP,
                current_profit: 0, 
                should_sell: false 
            };
        });

        res.json(openLots);

    } catch (error) {
        console.error(`Error fetching open inventory for ${targetTicker}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch open inventory.' });
    }
});


module.exports = router;