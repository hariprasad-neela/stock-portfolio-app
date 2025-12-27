import { kite } from '../services/zerodhaService.js';
import pool from '../db.js';

export const getLivePrices = async (req, res) => {
    const { symbols } = req.query;
    
    // Check if kite instance has an access token
    if (!kite.access_token) {
        return res.status(401).json({ 
            error: "Zerodha Disconnected", 
            message: "Please login to Zerodha to resume live tracking." 
        });
    }

    try {
        const quotes = await kite.getQuote(symbols.split(','));
        const priceMap = {};
        Object.keys(quotes).forEach(key => {
            priceMap[key] = quotes[key].last_price;
        });
        res.json(priceMap);
    } catch (err) {
        res.status(500).json({ error: "Kite API Error", detail: err.message });
    }
};

export const checkZerodhaStatus = async (req, res) => {
    try {
        // If there's no token at all, it's definitely disconnected
        if (!kite.access_token) {
            return res.json({ status: 'disconnected' });
        }

        // Test the token with a lightweight call
        await kite.getProfile(); 
        res.json({ status: 'active' });
    } catch (err) {
        // If Kite returns a TokenException, the session is expired
        res.json({ status: 'disconnected', reason: 'Session expired' });
    }
};

export const getActiveTickers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT ticker FROM stocks WHERE display = TRUE ORDER BY ticker ASC"
        );
        // Extracting just the strings into an array
        const tickers = result.rows.map(row => row.ticker);
        res.json(tickers);
    } catch (err) {
        console.error("Error fetching active tickers:", err);
        res.status(500).json({ error: "Failed to fetch tickers" });
    }
};