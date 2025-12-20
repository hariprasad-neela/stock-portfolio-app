import express from 'express';
import pool from './db.js';
const router = express.Router();

// Import the controller functions
import { 
    bulkSell,
    getOpenInventory, 
    // ... other imports like getTransactions, createTransaction
} from './controllers/transactionController.js';

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
// Placeholder IDs
const USER_ID = 'c122115f-d2f6-43c3-8f0a-7f66a7b213b2';
const PORTFOLIO_ID = '75d19a27-a0e2-4f19-b223-9c86b16e133e'; 


// -------------------------------------------------------------
// POST /api/transactions
// Adds a new stock transaction (BUY or SELL)
// -------------------------------------------------------------
router.post('/', async (req, res) => {
    // closed_lots_ids will be an array of UUIDs passed ONLY for a SELL transaction
    const {
        user_id = USER_ID, 
        portfolio_id = PORTFOLIO_ID, 
        ticker,
        type, // 'BUY' or 'SELL'
        date,
        quantity,
        price,
        closed_lots_ids = [] // NEW: Array of IDs of BUY lots being closed
    } = req.body;

    if (!ticker || !type || !date || !quantity || !price) {
        return res.status(400).json({ error: 'Missing required transaction fields.' });
    }
    
    // Ensure quantity and price are numbers
    const numQuantity = parseFloat(quantity);
    const numPrice = parseFloat(price);

// --- START TRANSACTION FOR ATOMICITY ---
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Ensure the stock exists and get its ID
        const stock_id = await findOrCreateStock(ticker.toUpperCase());
        
        // Determine initial is_open status for the new transaction
        // BUYs are always open (TRUE), SELLs are not (FALSE/NULL)
        const is_open = (type === 'BUY');
        
        // 2. Save the new transaction (BUY or SELL)
        const result = await client.query(
            `INSERT INTO transactions (portfolio_id, stock_id, type, date, quantity, price, is_open, closed_lots_ids) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [portfolio_id, stock_id, type, date, numQuantity, numPrice, is_open, closed_lots_ids]
        );
        const newTransaction = result.rows[0];
        
        // 3. If this is a SELL, update the 'is_open' status of the selected BUY lots (closed_lots_ids)
        if (type === 'SELL' && closed_lots_ids.length > 0) {
            // NOTE: Since we are not doing partial closes, we assume the user selected 
            // lots that total the SELL quantity, and we mark them as fully closed (is_open = FALSE).
            
            // In a real application, you would need complex logic to check partial closes here.
            // For now, we simplify: mark the selected BUY lots as fully closed.
            await client.query(
                `UPDATE transactions 
                 SET is_open = FALSE
                 WHERE transaction_id = ANY($1::uuid[])`, // Update all selected IDs
                [closed_lots_ids]
            );
        }

        await client.query('COMMIT'); // All steps succeeded

        res.status(201).json({ 
            message: 'Transaction saved successfully!', 
            transaction: newTransaction
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Roll back changes if any step failed
        console.error('Error saving transaction:', error.message);
        res.status(500).json({ error: 'Failed to save transaction due to a server error.' });
    } finally {
        client.release();
    }
});

// DELETE a transaction
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM transactions WHERE transaction_id = $1', [id]);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a transaction (Edit)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { date, quantity, price, type, is_open } = req.body;
    try {
        await pool.query(
            `UPDATE transactions 
             SET date = $1, quantity = $2, price = $3, type = $4, is_open = $5 
             WHERE transaction_id = $6`,
            [date, quantity, price, type, is_open, id]
        );
        res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all transactions for the ledger
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.transaction_id, 
                t.date, 
                t.type, 
                t.quantity, 
                t.price, 
                t.is_open,
                s.ticker 
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.portfolio_id = $1
            ORDER BY t.date DESC
        `, [PORTFOLIO_ID]); // Use your constant PORTFOLIO_ID

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching ledger:', error.message);
        res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
});

// Define the route for bulk selling
router.post('/bulk-sell', bulkSell);

router.get('/open-inventory/:ticker', getOpenInventory);

export default router;