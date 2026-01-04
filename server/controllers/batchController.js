import pool from '../db.js';

// GET: Fetch closed 1:1 pairs that don't have a batch_id
export const getUnbatchedPairs = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.ticker,
        b.price as buy_price,
        sel.price as sell_price,
        sel.quantity,
        b.date as buy_date,
        sel.date as sell_date,
        sel.transaction_id as sell_id,
        b.transaction_id as buy_id,
        ((sel.price - b.price) * sel.quantity) as realized_pnl
      FROM transactions sel
      JOIN transactions b ON sel.parent_buy_id = b.transaction_id
      JOIN stocks s ON sel.stock_id = s.stock_id
      WHERE sel.type = 'SELL' 
      AND sel.batch_id IS NULL
      ORDER BY sel.date DESC;
    `;

    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching unbatched pairs:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST: Group selected transaction IDs into a named batch
export const createBatch = async (req, res) => {
  const { batch_name, batch_date, transaction_ids } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Step 1: Insert into batches table and get the new UUID
    const batchResult = await client.query(
      'INSERT INTO batches (batch_name, batch_date) VALUES ($1, $2) RETURNING batch_id',
      [batch_name, batch_date]
    );
    const newBatchId = batchResult.rows[0].batch_id;

    // Step 2: Update transactions with the actual UUID, not the name string
    const updateQuery = `
      UPDATE transactions 
      SET batch_id = $1 
      WHERE transaction_id = ANY($2::uuid[])
    `;
    await client.query(updateQuery, [newBatchId, transaction_ids]);

    await client.query('COMMIT');
    res.status(201).json({ message: "Batch created", batch_id: newBatchId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const getBatches = async (req, res) => {
    const { page = 1, limit = 10, ticker, type } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = `
            SELECT batch_id, batch_name, batch_date 
            FROM batches
            WHERE 1=1
        `;
        const params = [];

        if (ticker) {
            params.push(`%${ticker}%`);
            query += ` AND s.ticker ILIKE $${params.length}`;
        }

        query += ` ORDER BY batch_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Also get total count for pagination math
        const countResult = await pool.query("SELECT COUNT(*) FROM batches");

        res.json({
            data: result.rows,
            total: parseInt(countResult.rows[0].count),
            pages: Math.ceil(countResult.rows[0].count / limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};