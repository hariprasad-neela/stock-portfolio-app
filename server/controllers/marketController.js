import { kite } from '../services/zerodhaService.js';

export const getLivePrices = async (req, res) => {
    const { symbols } = req.query; // e.g., "NSE:RELIANCE,NSE:TCS"
    
    if (!symbols) return res.status(400).json({ error: "No symbols provided" });

    try {
        const instrumentList = symbols.split(',');
        const quotes = await kite.getQuote(instrumentList);
        
        // Transform Zerodha's complex object into a simple { SYMBOL: PRICE } map
        const priceMap = {};
        Object.keys(quotes).forEach(key => {
            priceMap[key] = quotes[key].last_price;
        });

        res.json(priceMap);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch live prices. Is Zerodha connected?" });
    }
};