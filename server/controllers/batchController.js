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

export const getBatches = async (req, res) => {
  const { page = 1, limit = 10, ticker } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1. Base WHERE clause logic (Standardizing to reuse for list and summary)
    let whereClause = " WHERE 1=1";
    const params = [];
    if (ticker) {
      params.push(`%${ticker}%`);
      whereClause += ` AND batch_name ILIKE $${params.length}`;
    }

    // 2. The Comprehensive Query
    // We use a CTE (Common Table Expression) to get global stats once
    // and then select the paginated rows.
    const query = `
      WITH filtered_batches AS (
          SELECT * FROM batches ${whereClause}
      ),
      summary_stats AS (
          SELECT 
              COUNT(*) as global_count,
              SUM(profit) as global_profit,
              SUM(total_units) as global_units
          FROM filtered_batches
      )
      SELECT 
          fb.*, 
          ss.global_count, 
          ss.global_profit, 
          ss.global_units
      FROM filtered_batches fb
      CROSS JOIN summary_stats ss
      ORDER BY batch_date DESC 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    // Add pagination params to the array
    const queryParams = [...params, parseInt(limit), parseInt(offset)];
    const result = await pool.query(query, queryParams);

    // 3. Extracting Global Data from the first row (if exists)
    const firstRow = result.rows[0];
    const totalRecords = firstRow ? parseInt(firstRow.global_count) : 0;
    const globalSummary = {
      totalProfit: firstRow ? parseFloat(firstRow.global_profit || 0) : 0,
      totalUnits: firstRow ? parseInt(firstRow.global_units || 0) : 0,
      totalBatches: totalRecords
    };

    res.json({
      data: result.rows.map(({ global_count, global_profit, global_units, ...row }) => row),
      summary: globalSummary,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Error in getBatches:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper to calculate Batch Stats with Profit
const calculateBatchStats = async (client, transactionIds) => {
  const statsQuery = `
        SELECT 
            SUM(sel.quantity) as total_units,
            SUM(sel.quantity * (sel.date - b.date)) as total_weighted_days,
            SUM(sel.quantity * (sel.price - b.price)) as total_profit
        FROM transactions sel
        JOIN transactions b ON sel.parent_buy_id = b.transaction_id
        WHERE sel.transaction_id = ANY($1::uuid[])
    `;
    
  const result = await client.query(statsQuery, [transactionIds]);
  const row = result.rows[0];

  const units = parseFloat(row.total_units || 0);
  
  return {
    units: units,
    // Average days held across the batch
    days_held: units > 0 ? Math.round(parseInt(row.total_weighted_days) / units) : 0,
    // Total profit for the ₹150 threshold check
    profit: parseFloat(row.total_profit || 0)
  };
};

export const createBatch = async (req, res) => {
  const { batch_name, batch_date, transaction_ids, profit } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Calculate stats before storing
    const stats = await calculateBatchStats(client, transaction_ids);

    const batchResult = await client.query(
      'INSERT INTO batches (batch_name, batch_date, total_units, total_days_held, profit) VALUES ($1, $2, $3, $4, $5) RETURNING batch_id',
      [batch_name, batch_date, stats.units, stats.days_held, profit]
    );
    const newBatchId = batchResult.rows[0].batch_id;

    await client.query(
      'UPDATE transactions SET batch_id = $1 WHERE transaction_id = ANY($2::uuid[])',
      [newBatchId, transaction_ids]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: "Batch created", batch_id: newBatchId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
};

export const updateBatch = async (req, res) => {
  const { id } = req.params;
  const { batch_name, batch_date, transaction_ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const stats = await calculateBatchStats(client, transaction_ids);

    // 1. Reset all transactions currently tied to this batch
    await client.query('UPDATE transactions SET batch_id = NULL WHERE batch_id = $1', [id]);

    // 2. Update Batch metadata
    await client.query(
      'UPDATE batches SET batch_name = $1, batch_date = $2, total_units = $3, total_days_held = $4, profit = $5 WHERE batch_id = $6',
      [batch_name, batch_date, stats.units, stats.days_held, stats.profit, id]
    );

    // 3. Re-assign new selection
    await client.query(
      'UPDATE transactions SET batch_id = $1 WHERE transaction_id = ANY($2::uuid[])',
      [id, transaction_ids]
    );

    await client.query('COMMIT');
    res.json({ message: "Batch updated successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
};

export const getBatchById = async (req, res) => {
  const { id } = req.params;
  try {
    const batchQuery = `SELECT * FROM batches WHERE batch_id = $1`;
    const pairsQuery = `
      SELECT 
        s.ticker, b.price as buy_price, sel.price as sell_price, sel.quantity,
        b.date as buy_date, sel.date as sell_date, sel.transaction_id as sell_id,
        b.transaction_id as buy_id, ((sel.price - b.price) * sel.quantity) as realized_pnl
      FROM transactions sel
      JOIN transactions b ON sel.parent_buy_id = b.transaction_id
      JOIN stocks s ON sel.stock_id = s.stock_id
      WHERE sel.batch_id = $1
    `;

    const batch = await pool.query(batchQuery, [id]);
    const pairs = await pool.query(pairsQuery, [id]);

    if (batch.rows.length === 0) return res.status(404).json({ error: "Batch not found" });

    res.json({ ...batch.rows[0], currentPairs: pairs.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
