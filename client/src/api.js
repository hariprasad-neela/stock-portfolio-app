// client/src/api.js
import axios from 'axios';

// Create an axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000', // Your Backend URL
});

export default api;