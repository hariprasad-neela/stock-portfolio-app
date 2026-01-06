import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const fetchStocks = createAsyncThunk('stocks/fetchStocks', async () => {
  const response = await axios.get(`${API_BASE}/api/stocks`);
  return response.data;
});

export const fetchMarketQuotes = createAsyncThunk(
  'stocks/fetchQuotes',
  async (tickers: string[], { rejectWithValue }) => {
    try {
      if (!tickers || tickers.length === 0) return {};
      
      const symbols = [...new Set(tickers.map(t => `NSE:${t}`))].join(',');
      const url = `https://stock-portfolio-api-f38f.onrender.com/api/market/quotes?symbols=${symbols}`;
      
      const response = await fetch(url);
      const json = await response.json();

      //if (json.status !== "success") throw new Error("API Error");
      console.log("Fetched Market Quotes:", json)
      return json; // This becomes the action.payload
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const stocksSlice = createSlice({
  name: 'stocks',
  initialState: { 
    list: [], 
    status: 'idle', 
    error: null,
    liveData: {}, // Format: { "NSE:INFY": { last_price: ... } }
    loading: false
 },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStocks.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchStocks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchStocks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      }).addCase(fetchMarketQuotes.pending, (state) => {
        state.loading = true;
      }).addCase(fetchMarketQuotes.fulfilled, (state, action) => {
        state.loading = false;
        state.liveData = action.payload;
        state.error = null;
      })
      .addCase(fetchMarketQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLiveData, updateSingleQuote } = stocksSlice.actions;
export default stocksSlice.reducer;