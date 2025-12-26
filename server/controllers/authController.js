import { kite } from '../services/zerodhaService.js';

export const getZerodhaLoginUrl = (req, res) => {
    try {
        const url = kite.getLoginURL();
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate login URL" });
    }
};

export const handleZerodhaCallback = async (req, res) => {
    const { request_token } = req.query;

    try {
        const response = await kite.generateSession(request_token, process.env.ZERODHA_API_SECRET);
        
        // This is the critical line that fixes your error:
        kite.setAccessToken(response.access_token);
        
        console.log("Zerodha Session Active:", response.user_name);
        
        // Redirect back to your Vercel frontend or show success
        res.send("<h1>Authenticated!</h1><p>You can close this window now.</p>");
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(500).send("Authentication failed");
    }
};