import pool from "../db.js";

export const getPortfolioOverview = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.ticker,
                s.stock_id,
                SUM(t.quantity) as net_qty,
                SUM(t.quantity * t.price) as total_invested,
                (SUM(t.quantity * t.price) / SUM(t.quantity)) as avg_buy_price
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.is_open = true AND t.type = 'BUY'
            GROUP BY s.ticker, s.stock_id;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Portfolio Overview Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
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
