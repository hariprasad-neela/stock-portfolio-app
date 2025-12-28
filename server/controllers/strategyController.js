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
                s.ticker, 
                SUM(t.quantity) as total_qty,
                SUM(t.quantity * t.price) / NULLIF(SUM(t.quantity), 0) as avg_price,
                SUM(t.quantity * t.price) as total_cost
            FROM transactions t
            JOIN stocks s ON t.stock_id = s.stock_id
            WHERE t.type = 'BUY'
            AND t.is_open = TRUE
            GROUP BY s.ticker
            ORDER BY total_cost DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Aggregation Error:", err.message);
        res.status(500).json({ error: "Failed to consolidate portfolio data" });
    }
};
