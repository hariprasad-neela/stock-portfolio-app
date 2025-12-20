// server/strategyRoutes.js
import express from 'express';
import pool from './db.js';
const router = express.Router();
import { getPortfolioOverview, getAllStocks } from './controllers/strategyController.js';

// Placeholder Portfolio ID
const PORTFOLIO_ID = '75d19a27-a0e2-4f19-b223-9c86b16e133e'; 


// =============================================================
// GET /api/strategy/open-inventory/:ticker
// Fetches only the raw, unclosed BUY transactions (lots) for a symbol.
// ABP, Units Held, and Profit are calculated on the frontend.
// =============================================================
router.get('/open-inventory/:ticker', async (req, res) => {
    const targetTicker = req.params.ticker.toUpperCase(); 

    try {
        // Query to fetch open BUY transactions (where is_open = TRUE)
        const openInventoryQuery = `
            SELECT 
                t.transaction_id,
                t.date,
                t.quantity AS open_quantity,
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

        // Send raw lots data to the frontend for calculation
        const openLots = result.rows.map(row => ({
            transaction_id: row.transaction_id,
            date: new Date(row.date).toLocaleDateString('en-IN', { timeZone: 'UTC' }),
            open_quantity: parseFloat(row.open_quantity),
            buy_price: parseFloat(row.buy_price),
        }));

        res.json(openLots);

    } catch (error) {
        console.error(`Error fetching open inventory for ${targetTicker}:`, error.message);
        res.status(500).json({ error: 'Failed to fetch open inventory.' });
    }
});

// Define the endpoint for the overview cards
router.get('/portfolio-overview', getPortfolioOverview);

router.get('/stocks', getAllStocks);

export default router;