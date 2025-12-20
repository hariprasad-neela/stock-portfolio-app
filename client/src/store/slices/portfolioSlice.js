// client/src/store/slices/portfolioSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch open lots for a specific ticker
export const fetchOpenLots = createAsyncThunk(
  'portfolio/fetchOpenLots',
  async (ticker) => {
    const response = await axios.get(`/api/transactions/open-inventory/${ticker}`);
    return response.data;
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: {
    selectedTicker: 'SILVERBEES',
    openLots: [],
    metrics: { units: 0, abp: 0, capital: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    setTicker: (state, action) => {
      state.selectedTicker = action.payload;
    },
    // Action to update metrics after calculation
    updateMetrics: (state, action) => {
      state.metrics = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenLots.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOpenLots.fulfilled, (state, action) => {
        state.loading = false;
        state.openLots = action.payload;
      })
      .addCase(fetchOpenLots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setTicker, updateMetrics } = portfolioSlice.actions;
export default portfolioSlice.reducer;