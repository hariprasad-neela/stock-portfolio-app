// server/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase/Render connections
    },
    // ⬇️ ADD THIS LINE TO FORCE IPV4
    family: 4
});

module.exports = pool;