import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const fetchStocks = createAsyncThunk('stocks/fetchStocks', async () => {
  const response = await axios.get(`${API_BASE}/api/stocks`);
  return response.data;
});

const stocksSlice = createSlice({
  name: 'stocks',
  initialState: { list: [], status: 'idle', error: null },
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
      });
  },
});

export default stocksSlice.reducer;