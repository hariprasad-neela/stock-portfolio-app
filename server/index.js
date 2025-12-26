// server/index.js
import express from 'express';
import cors from 'cors';
//require('dotenv').config();
import pool from './db.js';
import transactionRoutes from './transactionRoutes.js'; // <-- 1. Import the router
import strategyRoutes from './strategyRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
// import dataRoutes from './dataRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'http://localhost:5173', // Local frontend URL
    process.env.FRONTEND_URL // Will be added for production (Vercel URL)
];

app.use(cors({
  origin: 'https://stock-portfolio-app-kappa.vercel.app/', // Allow your Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// -----------------------------------------------------------------
// 2. Use the Transaction Router
app.use('/api/transactions', transactionRoutes); 
app.use('/api/strategy', strategyRoutes);
app.use('/api/batches', batchRoutes);
// app.use('/api/data', dataRoutes);

// -----------------------------------------------------------------

// Root Route
app.get('/', (req, res) => {
    res.send('Stock Portfolio Backend is Running!');
});

// Test Route (Keep this for debugging)
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()'); 
        res.json({ success: true, time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});