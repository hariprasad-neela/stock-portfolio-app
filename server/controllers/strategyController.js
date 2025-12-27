import pool from "../db.js";

export const getPortfolioOverview = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.ticker, 
                s.stock_id,
                -- Total units: Buys minus Sells
                SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) as total_units,
                -- Weighted average buy price
                ROUND(AVG(CASE WHEN t.type = 'BUY' THEN t.price END)::numeric, 2) as avg_price
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.portfolio_id = $1
            GROUP BY s.ticker, s.stock_id
            -- Only show stocks where the user actually still owns units
            HAVING SUM(CASE WHEN t.type = 'BUY' THEN t.quantity ELSE -t.quantity END) > 0;
        `;
        const result = await pool.query(query, [req.query.profile_id || '75d19a27-a0e2-4f19-b223-9c86b16e133e']);
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

export const getConsolidatedPortfolio = async (req, res) => {
    try {
        const query = `
            SELECT 
                ticker, 
                SUM(open_quantity) as total_qty,
                SUM(open_quantity * buy_price) / SUM(open_quantity) as avg_price,
                SUM(open_quantity * buy_price) as total_cost
            FROM transactions
            WHERE open_quantity > 0
            GROUP BY ticker
            ORDER BY total_cost DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
