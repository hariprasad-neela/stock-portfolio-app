import { KiteConnect } from "kiteconnect";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.ZERODHA_API_KEY;
const apiSecret = process.env.ZERODHA_API_SECRET;

// Singleton instance
export const kite = new KiteConnect({
    api_key: apiKey,
});

// Helper to set the token after login
export const setKiteAccessToken = (token) => {
    kite.setAccessToken(token);
};