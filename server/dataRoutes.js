// server/dataRoutes.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

const API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

// Helper function to fetch the latest EOD data
async function fetchDailyData(ticker) {
    if (!API_KEY) {
        throw new Error("FMP_API_KEY is missing from environment variables.");
    }

    // FMP often requires the exchange suffix for non-US stocks. 
    // We assume SILVERBEES is SILVERBEES.NSE or similar for accuracy.
    // For this demonstration, we'll try the bare ticker first.
    
    try {
        // Fetch the latest quote data (includes OHL for the last trading day)
        const response = await axios.get(`${BASE_URL}/quote/${ticker}`, {
            params: {
                apikey: API_KEY
            }
        });

        // FMP returns an array of quotes
        if (!response.data || response.data.length === 0) {
            throw new Error(`FMP Error: Ticker '${ticker}' not found or no data returned.`);
        }
        
        const latestData = response.data[0];
        
        // Map FMP keys to required OHL format
        const dailyPrices = {
            date: new Date().toISOString().split('T')[0], // Use current date as placeholder if EOD date is not clear
            open: parseFloat(latestData.open),
            high: parseFloat(latestData.dayHigh),
            low: parseFloat(latestData.dayLow),
            close: parseFloat(latestData.price), // Current price
            // The FMP quote API provides the necessary OHL data for decision making
        };
        
        return dailyPrices;

    } catch (error) {
        console.error('FMP Data Fetch Error:', error.message);
        // This gives a more specific error message back to the frontend
        throw new Error(`Failed to fetch FMP data: ${error.message}`);
    }
}


// -------------------------------------------------------------
// GET /api/data/latest/:ticker
// Fetches the latest daily OHL prices for a given ticker
// -------------------------------------------------------------
router.get('/latest/:ticker', async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    
    try {
        const dailyPrices = await fetchDailyData(ticker);
        res.json(dailyPrices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;