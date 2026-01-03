import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const fetchOpenTrades = createAsyncThunk('trades/fetchOpenTrades', async () => {
  const response = await axios.get(`${API_BASE}/api/transactions/open`);
  return response.data;
});

export const fetchTradeById = createAsyncThunk(
  'trades/fetchById',
  async (id: string) => {
    const response = await axios.get(`${API_BASE}/api/transactions/${id}`);
    return response.data;
  }
);

const tradesSlice = createSlice({
  name: 'trades',
  initialState: { openTrades: [], status: 'idle' },
  reducers: {
    // Manually remove a lot after a successful SELL to keep UI snappy
    removeOpenTrade: (state, action) => {
      state.openTrades = state.openTrades.filter(t => t.transaction_id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenTrades.fulfilled, (state, action) => {
        state.openTrades = action.payload;
        state.status = 'succeeded';
      });
  },
});

export const { removeOpenTrade } = tradesSlice.actions;
export default tradesSlice.reducer;