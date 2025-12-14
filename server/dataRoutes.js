// server/dataRoutes.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();

const API_KEY = process.env.ALPHA_VANTAGE_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Helper function to fetch Time Series (Daily Adjusted) data
async function fetchDailyData(ticker) {
    // NOTE: Alpha Vantage uses global symbols. You may need to find a proxy 
    // or use a more India-specific API later. For demo, we use MSFT as proxy.
    const symbol = ticker === 'SILVERBEES' ? 'MSFT' : ticker; // Placeholder mapping
    
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                function: 'TIME_SERIES_DAILY_ADJUSTED',
                symbol: symbol,
                apikey: API_KEY,
                outputsize: 'compact' // Get the last 100 data points
            }
        });

        const timeSeries = response.data['Time Series (Daily)'];
        if (!timeSeries) {
            console.error('Alpha Vantage Error:', response.data['Note'] || response.data['Error Message']);
            throw new Error(`Could not fetch data for ${ticker}. API returned an error.`);
        }

        // --- Extract latest day's data ---
        const latestDate = Object.keys(timeSeries)[0];
        const latestData = timeSeries[latestDate];
        
        // Map Alpha Vantage keys to required OHL format
        const dailyPrices = {
            date: latestDate,
            open: parseFloat(latestData['1. open']),
            high: parseFloat(latestData['2. high']),
            low: parseFloat(latestData['3. low']),
            close: parseFloat(latestData['4. close']),
            // Adjusted close is useful for historical backtesting
            adjusted_close: parseFloat(latestData['5. adjusted close']) 
        };
        
        return dailyPrices;

    } catch (error) {
        console.error('Data Fetch Error:', error.message);
        throw new Error('Failed to communicate with external API.');
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