import pool from '../db.js';

export const getCandles = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT *FROM candle_data WHERE stock='YESBANK' ORDER BY date ASC"
        );
        // Extracting just the strings into an array
        const tickers = result.rows.map(row => row.ticker);
        res.json(tickers);
    } catch (err) {
        console.error("Error fetching Candle data --------:", err);
        res.status(500).json({ error:  err});
    }
};
