import pool from '../db.js';

export const getStocksList = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT stock_id, ticker, display FROM stocks ORDER BY ticker ASC'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error fetching stock list" });
  }
};