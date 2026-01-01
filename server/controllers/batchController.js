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
  const { batch_name, transaction_ids } = req.body; // transaction_ids is an array of UUIDs

  if (!batch_name || !transaction_ids || transaction_ids.length === 0) {
    return res.status(400).json({ error: "Batch name and transaction IDs are required." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Start Transaction for data integrity

    const updateQuery = `
      UPDATE transactions 
      SET batch_id = $1 
      WHERE transaction_id = ANY($2::uuid[])
    `;

    await client.query(updateQuery, [batch_name, transaction_ids]);
    
    await client.query('COMMIT');
    res.status(201).json({ message: `Batch '${batch_name}' created successfully.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error creating batch:", err.message);
    res.status(500).json({ error: "Failed to create batch." });
  } finally {
    client.release();
  }
};
