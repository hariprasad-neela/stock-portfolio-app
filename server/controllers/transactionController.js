import pool from '../db.js';

export const bulkSell = async (req, res) => {
    const { ticker, quantity, price, date, selectedBuyIds } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start transaction

        // 1. Insert the SELL transaction
        const sellRes = await client.query(
            `INSERT INTO transactions (ticker, type, quantity, price, date, is_open) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING transaction_id`,
            [ticker, 'SELL', quantity, price, date, false]
        );
        const sellId = sellRes.rows[0].transaction_id;

        // 2. Loop through selected BUY IDs to map them
        for (const buyId of selectedBuyIds) {
            // Get the quantity of this specific BUY lot to record the link accurately
            const buyLotRes = await client.query(
                'SELECT open_quantity FROM transactions WHERE transaction_id = $1',
                [buyId]
            );
            const qtyToClose = buyLotRes.rows[0].open_quantity;

            // Ensure the array of IDs is treated as a UUID array in the query
            await client.query(
                'UPDATE transactions SET is_open = false, open_quantity = 0 WHERE transaction_id = ANY($1::uuid[])',
                [selectedBuyIds]
            );

            // Create the Mapping Link
            await client.query(
                `INSERT INTO transaction_links (sell_transaction_id, buy_transaction_id, quantity_closed) 
                 VALUES ($1, $2, $3)`,
                [sellId, buyId, qtyToClose]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "Trade matched and closed successfully", sellId });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

export const getOpenInventory = async (req, res) => {
    try {
        const { ticker } = req.params; // SILBERBEES will come from here

        const query = `
            SELECT 
                transaction_id, 
                date, 
                quantity AS open_quantity, 
                price AS buy_price 
            FROM transactions 
            WHERE ticker = $1 AND type = 'BUY' AND is_open = true
            ORDER BY date ASC
        `;

        const result = await pool.query(query, [ticker]);

        // If everything is fine but no data found, return an empty array (not 404)
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getLedger = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const tickerFilter = req.query.ticker || ''; // Search input
        const offset = (page - 1) * limit;

        // We JOIN with the stocks table to get the 'ticker' column
        // We use t.* to get all transaction fields and s.ticker to get the name
        let query = `
            SELECT t.*, s.ticker, count(*) OVER() AS total_count 
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE 1=1
        `;
        const params = [];

        if (tickerFilter) {
            params.push(`%${tickerFilter.toUpperCase()}%`);
            query += ` AND s.ticker LIKE $${params.length}`; // Search by name, not ID
        }

        query += ` ORDER BY t.date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        
        const totalRecords = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

        res.json({
            data: result.rows, // Now includes a 'ticker' field
            pagination: {
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit) || 1,
                currentPage: page,
                limit: limit
            }
        });
    } catch (err) {
        console.error("Ledger Fetch Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const addTransaction = async (req, res) => {
    // 1. Destructure with explicit names
    const { 
        stock_id, 
        type, 
        quantity, 
        price, 
        date,
        portfolio_id 
    } = req.body;
    
    // V2 Stability Fix: Explicit check for undefined/null 
    // This allows quantity or price to be 0 without failing
    if (
        stock_id === undefined || 
        type === undefined || 
        quantity === undefined || 
        price === undefined || 
        date === undefined
    ) {
        console.log("Validation Failed. Received:", req.body); // Check your terminal!
        return res.status(400).json({ error: "Missing required transaction fields." });
    }

    try {
        // 2. Use a transaction block or explicit param mapping
        const insertQuery = `
            INSERT INTO transactions (stock_id, type, quantity, price, date, is_open, portfolio_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        
        const isOpen = (type === 'BUY');
        
        // 3. Log exactly what is being sent to the DB for debugging
        console.log("DB INSERT PARAMS:", [stock_id, type, quantity, price, date, isOpen]);

        const result = await pool.query(insertQuery, [
            stock_id,
            type, 
            quantity, 
            price, 
            date, 
            isOpen,
            portfolio_id || "75d19a27-a0e2-4f19-b223-9c86b16e133e", // Fallback to 1 if not provided
        ]);
        
        const newRecord = result.rows[0];

        // 4. Join the ticker so the frontend can verify visually
        const verification = await pool.query(
            'SELECT ticker FROM stocks WHERE stock_id = $1', 
            [newRecord.stock_id]
        );

        res.status(201).json({
            ...newRecord,
            ticker: verification.rows[0]?.ticker
        });
    } catch (err) {
        console.error("Critical Add Error:", err);
        res.status(500).json({ error: "DB Insertion Failed" });
    }
};

// server/controllers/transactionController.js

// 1. Delete Transaction
export const deleteTransaction = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM transactions WHERE transaction_id = $1', [id]);
        res.json({ message: "Transaction deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Update Transaction
export const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { stock_id, type, quantity, price, date } = req.body;
    try {
        const query = `
            UPDATE transactions 
            SET stock_id = $1, type = $2, quantity = $3, price = $4, date = $5
            WHERE transaction_id = $6
            RETURNING *;
        `;
        const result = await pool.query(query, [stock_id, type, quantity, price, date, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTransactions = async (req, res) => {
    const { page = 1, limit = 10, ticker, type } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT t.*, s.ticker 
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (ticker) {
            params.push(`%${ticker}%`);
            query += ` AND s.ticker ILIKE $${params.length}`;
        }

        query += ` ORDER BY t.date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        
        // Also get total count for pagination math
        const countResult = await pool.query("SELECT COUNT(*) FROM transactions");
        
        res.json({
            data: result.rows,
            total: parseInt(countResult.rows[0].count),
            pages: Math.ceil(countResult.rows[0].count / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const saveTransaction = async (req, res) => {
    const { ticker, quantity, price, date, type } = req.body;
    
    try {
        // 1. Get the stock_id for the given ticker
        const stockResult = await pool.query("SELECT id FROM stocks WHERE ticker = $1", [ticker]);
        
        if (stockResult.rows.length === 0) {
            return res.status(400).json({ message: `Ticker ${ticker} not found in stocks table.` });
        }
        
        const stock_id = stockResult.rows[0].id;

        // 2. Insert the new transaction
        const insertQuery = `
            INSERT INTO transactions (stock_id, quantity, price, date, type, is_open, portfolio_id)
            VALUES ($1, $2, $3, $4, $5, TRUE, 'your-default-portfolio-id')
            RETURNING *
        `;
        
        const result = await pool.query(insertQuery, [stock_id, quantity, price, date, type]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};