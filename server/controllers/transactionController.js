import pool from '../db.js';

export const getOpenInventory = async (req, res) => {
    try {
        const { ticker } = req.params; // SILBERBEES will come from here

        const query = `
            SELECT 
                transaction_id, 
                date, 
                quantity, 
                price 
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

export const createTransaction = async (req, res) => {
    // Note: transaction_id comes from the body when editing
    const { transaction_id, ticker, quantity, price, date, type, parent_buy_id, external_id } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Resolve stock_id and portfolio_id (Same as before)
        const stockRes = await client.query("SELECT stock_id FROM stocks WHERE ticker = $1", [ticker]);
        const stock_id = stockRes.rows[0].stock_id;
        const portRes = await client.query("SELECT portfolio_id FROM portfolios LIMIT 1");
        const portfolio_id = portRes.rows[0].portfolio_id;

        let result;

        if (transaction_id) {
            // ✅ CASE A: UPDATE existing record
            const updateQuery = `
                UPDATE transactions 
                SET stock_id = $1, portfolio_id = $2, type = $3, date = $4, 
                    quantity = $5, price = $6, parent_buy_id = $7,
                    external_id = $8
                WHERE transaction_id = $9
                RETURNING *
            `;
            result = await client.query(updateQuery, [
                stock_id, portfolio_id, type, date, quantity, price, parent_buy_id || null, external_id, transaction_id
            ]);
        } else {
            // ✅ CASE B: INSERT new record
            const insertQuery = `
                INSERT INTO transactions 
                (portfolio_id, stock_id, type, date, quantity, price, parent_buy_id, is_open, external_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            const is_open = (type === 'BUY');
            result = await client.query(insertQuery, [
                portfolio_id, stock_id, type, date, quantity, price, parent_buy_id || null, is_open, external_id
            ]);
        }

        // 2. Handle 1:1 Matching Logic for SELLs
        if (type === 'SELL' && parent_buy_id) {
            await client.query(
                "UPDATE transactions SET is_open = FALSE WHERE transaction_id = $1",
                [parent_buy_id]
            );
        }

        await client.query('COMMIT');
        res.status(transaction_id ? 200 : 201).json(result.rows[0]);

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

export const updateTransaction = async (req, res) => {
    const { id } = req.params; // ID from the URL
    const { ticker, quantity, price, date, type, parent_buy_id } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Resolve IDs
        const stockRes = await client.query("SELECT stock_id FROM stocks WHERE ticker = $1", [ticker]);
        const stock_id = stockRes.rows[0].stock_id;

        // 2. Cleanup Logic: Find the OLD parent_buy_id before updating
        const oldTxRes = await client.query(
            "SELECT parent_buy_id FROM transactions WHERE transaction_id = $1", 
            [id]
        );
        const oldParentId = oldTxRes.rows[0]?.parent_buy_id;

        // 3. Update the transaction
        const updateQuery = `
            UPDATE transactions 
            SET stock_id = $1, type = $2, date = $3, quantity = $4, price = $5, parent_buy_id = $6
            WHERE transaction_id = $7
            RETURNING *
        `;
        const result = await client.query(updateQuery, [
            stock_id, type, date, quantity, price, parent_buy_id || null, id
        ]);

        // 4. Manage Buy Lot Status
        // If the parent buy lot changed, reopen the old one
        if (oldParentId && oldParentId !== parent_buy_id) {
            await client.query("UPDATE transactions SET is_open = TRUE WHERE transaction_id = $1", [oldParentId]);
        }
        
        // Mark the new parent buy lot as closed
        if (parent_buy_id) {
            await client.query("UPDATE transactions SET is_open = FALSE WHERE transaction_id = $1", [parent_buy_id]);
        }

        await client.query('COMMIT');
        res.json(result.rows[0]);

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};

export const getOpenTrades = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.transaction_id, 
        s.ticker, 
        t.stock_id,
        t.type, 
        t.quantity, 
        t.price, 
        t.date, 
        t.is_open
      FROM transactions t
      JOIN stocks s ON t.stock_id = s.stock_id
      WHERE t.is_open = TRUE AND t.type = 'BUY'
      ORDER BY t.date DESC
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error fetching open trades" });
  }
};

export const getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT t.*, s.ticker 
      FROM transactions t 
      JOIN stocks s ON t.stock_id = s.stock_id 
      WHERE t.transaction_id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// transactionController.js

export const getSyncedExternalIds = async (req, res) => {
  try {
    // We only care about transactions that have an external_id linked
    // and were created recently (to match today's Zerodha orders)
    const query = `
      SELECT 
        external_id, 
        SUM(quantity) as synced_quantity,
        COUNT(*) as lot_count
      FROM transactions
      WHERE external_id IS NOT NULL 
      AND date >= CURRENT_DATE - INTERVAL '1 day'
      GROUP BY external_id;
    `;

    const result = await pool.query(query);

    // Convert the array to a Key-Value map for O(1) lookup on frontend
    // Format: { "order_id_123": 40, "order_id_456": 100 }
    const syncMap = result.rows.reduce((acc, row) => {
      acc[row.external_id] = {
        quantity: parseFloat(row.synced_quantity),
        lots: parseInt(row.lot_count)
      };
      return acc;
    }, {});

    res.status(200).json(syncMap);
  } catch (err) {
    console.error("Error fetching synced IDs:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};