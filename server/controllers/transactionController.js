// server/controllers/transactionController.js

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
