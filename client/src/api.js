// client/src/api.js
import axios from 'axios';

// Create an axios instance
const api = axios.create({
    //baseURL: 'http://localhost:5000', // Your Backend URL
    baseURL: 'https://stock-portfolio-api-f38f.onrender.com/'
});

export default api;