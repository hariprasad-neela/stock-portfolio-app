import pool from '../db.js';

// Ensure the 'export' keyword is right here
export const createSelectiveBatch = async (req, res) => {
    const { batch_name, transaction_ids, portfolio_id, target_profit_pct } = req.body;

    if (!transaction_ids || transaction_ids.length === 0) {
        return res.status(400).json({ error: "No lots selected for batching." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create the Batch record
        const batchQuery = `
            INSERT INTO batches (batch_name, portfolio_id, target_profit_pct)
            VALUES ($1, $2, $3)
            RETURNING batch_id;
        `;
        const batchResult = await client.query(batchQuery, [
            batch_name || `Strategy_${Date.now()}`,
            portfolio_id,
            target_profit_pct || 10.00
        ]);

        const newBatchId = batchResult.rows[0].batch_id;

        // Link transactions to the batch
        const updateTransactionsQuery = `
            UPDATE transactions
            SET batch_id = $1
            WHERE transaction_id = ANY($2::uuid[])
            AND portfolio_id = $3;
        `;
        await client.query(updateTransactionsQuery, [newBatchId, transaction_ids, portfolio_id]);

        await client.query('COMMIT');

        res.status(201).json({
            message: "Batch created successfully",
            batch_id: newBatchId
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Batch Creation Error:", error);
        res.status(500).json({ error: "Database transaction failed." });
    } finally {
        client.release();
    }
};