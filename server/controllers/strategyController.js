import pool from "../db.js";

export const getPortfolioOverview = async (req, res) => {
    try {
        // This query groups by stock and calculates weighted average cost
        const query = `
            SELECT 
                s.ticker,
                SUM(t.quantity) as total_qty,
                SUM(t.quantity * t.price) as total_invested,
                (SUM(t.quantity * t.price) / SUM(t.quantity)) as avg_price
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.type = 'BUY' AND t.status = 'OPEN'
            GROUP BY s.ticker
            HAVING SUM(t.quantity) > 0;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllStocks = async (req, res) => {
    try {
        const result = await pool.query('SELECT stock_id, ticker FROM stocks ORDER BY ticker ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
