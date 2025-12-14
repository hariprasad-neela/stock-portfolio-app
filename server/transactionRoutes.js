// server/transactionRoutes.js
const express = require('express');
const pool = require('./db');
const router = express.Router();

/**
 * Helper function to find a stock by its ticker (or insert it if it doesn't exist).
 * This prevents creating duplicate entries in the 'stocks' table.
 */
const findOrCreateStock = async (ticker) => {
    try { 
        // 1. Try to find the stock
        let result = await pool.query(
            'SELECT stock_id FROM stocks WHERE ticker = $1',
            [ticker]
        );

        if (result.rows.length > 0) {
            // Found: return the existing ID
            return result.rows[0].stock_id;
        }

        // 2. Not Found: Insert the new stock
        // Note: For now, we only insert the ticker. Later, you'll enrich this with API calls.
        result = await pool.query(
            'INSERT INTO stocks (ticker) VALUES ($1) RETURNING stock_id',
            [ticker]
        );

        // Return the newly created ID
        return result.rows[0].stock_id;

    } catch (error) {
        console.error('Error in findOrCreateStock:', error.message);
        throw new Error('Database error during stock lookup.');
    }
};

// -------------------------------------------------------------
// POST /api/transactions
// Adds a new stock transaction (BUY or SELL)
// -------------------------------------------------------------
router.post('/', async (req, res) => {
    // NOTE: This assumes you will manually input the user_id for now.
    // In the future, this will be retrieved from the session/JWT.
    const {
        user_id = 'c122115f-d2f6-43c3-8f0a-7f66a7b213b2', // Placeholder User ID
        portfolio_id = '75d19a27-a0e2-4f19-b223-9c86b16e133e', // Placeholder Portfolio ID
        ticker,
        type, // 'BUY' or 'SELL'
        date,
        quantity,
        price
    } = req.body;

    if (!ticker || !type || !date || !quantity || !price) {
        return res.status(400).json({ error: 'Missing required transaction fields.' });
    }
    
    // Ensure quantity and price are numbers
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);

    try {
        // 1. Ensure the stock exists and get its ID
        const stock_id = await findOrCreateStock(ticker.toUpperCase());

        // 2. Save the transaction to the database
        const result = await pool.query(
            `INSERT INTO transactions (portfolio_id, stock_id, type, date, quantity, price) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [portfolio_id, stock_id, type, date, numQuantity, numPrice]
        );

        res.status(201).json({ 
            message: 'Transaction saved successfully!', 
            transaction: result.rows[0] 
        });

    } catch (error) {
        console.error('Error saving transaction:', error.message);
        res.status(500).json({ error: 'Failed to save transaction due to a server error.' });
    }
});


module.exports = router;