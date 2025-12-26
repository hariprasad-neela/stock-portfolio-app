import { KiteConnect } from "kiteconnect";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.ZERODHA_API_KEY;
const apiSecret = process.env.ZERODHA_API_SECRET;

// This instance will be initialized after the login flow
let kite = new KiteConnect({ api_key: apiKey });

export const getLiveQuotes = async (instruments) => {
    try {
        // instruments example: ["NSE:RELIANCE", "NSE:INFY"]
        const quotes = await kite.getQuote(instruments);
        return quotes;
    } catch (error) {
        console.error("Zerodha Quote Error:", error);
        throw error;
    }
};

export { kite };