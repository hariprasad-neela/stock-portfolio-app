import pool from "../db.js";

export const getPortfolioOverview = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.ticker, 
                s.stock_id,
                SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) as units_held,
                AVG(CASE WHEN t.type = 'BUY' THEN t.price END) as avg_buy_price
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.portfolio_id = $1
            GROUP BY s.ticker, s.stock_id
            HAVING SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) > 0;
        `;
        const result = await pool.query(query, [req.query.portfolio_id || 1]);
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
