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
        const ticker = req.query.ticker || '';
        const offset = (page - 1) * limit;

        // 1. Build the query with a Window Function (count(*) OVER()) 
        // to get the total count without a second query
        let query = `
            SELECT *, count(*) OVER() AS total_count 
            FROM transactions 
            WHERE 1=1
        `;
        const params = [];

        if (ticker) {
            params.push(ticker.toUpperCase());
            query += ` AND ticker = $${params.length}`;
        }

        query += ` ORDER BY date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // 2. Extract total count from the first row (if exists)
        const totalRecords = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
        const totalPages = Math.ceil(totalRecords / limit);

        // 3. Construct the structured response
        res.json({
            data: result.rows,
            pagination: {
                totalRecords,
                totalPages: totalPages || 1,
                currentPage: page,
                limit: limit
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
