import pool from '../db.js';
const data = require("../../Candle%20Data/YESBANK.json");

export const getCandles = async (req, res) => {
    try {
        const { ticker } = req.params;

        const query = "SELECT *FROM candle_data WHERE \"STOCK\"=$1 ORDER BY \"DATE\" ASC"
        const result = await pool.query(query, [ticker]);
        
        // Extracting just the strings into an array
        const tickers = result.rows.map(row => row);
        res.json(data);
    } catch (err) 
        console.error("Error fetching Candle data --------:", err);
        res.status(500).json({ error:  err});
    }
};
