import pool from "../db.js";

const createSelectiveBatch = async (req, res) => {
    const { batch_name, transaction_ids, portfolio_id, target_profit_pct } = req.body;

    // 1. Basic Validation
    if (!transaction_ids || transaction_ids.length === 0) {
        return res.status(400).json({ error: "No lots selected for batching." });
    }

    const client = await pool.connect();

    try {
        // 2. Start the Database Transaction
        await client.query('BEGIN');

        // 3. Create the Batch record
        const batchQuery = `
            INSERT INTO batches (batch_name, portfolio_id, target_profit_pct)
            VALUES ($1, $2, $3)
            RETURNING batch_id;
        `;
        const batchResult = await client.query(batchQuery, [
            batch_name || `Strategy_${Date.now()}`,
            portfolio_id,
            target_profit_pct || 10.00 // Default 10% target
        ]);

        const newBatchId = batchResult.rows[0].batch_id;

        // 4. Update the selected transactions with the new batch_id
        // This links specific lots to our strategy
        const updateTransactionsQuery = `
            UPDATE transactions
            SET batch_id = $1
            WHERE transaction_id = ANY($2::uuid[])
            AND portfolio_id = $3;
        `;
        await client.query(updateTransactionsQuery, [newBatchId, transaction_ids, portfolio_id]);

        // 5. Commit the Transaction
        await client.query('COMMIT');

        res.status(201).json({
            message: "Batch created and lots linked successfully",
            batch_id: newBatchId
        });

    } catch (error) {
        // 6. Rollback if anything fails
        await client.query('ROLLBACK');
        console.error("Batch Creation Error:", error);
        res.status(500).json({ error: "Failed to create batch. Data rolled back." });
    } finally {
        client.release();
    }
};

module.exports = { createSelectiveBatch };