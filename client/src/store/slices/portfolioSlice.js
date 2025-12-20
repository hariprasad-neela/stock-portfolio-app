// client/src/store/slices/portfolioSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api'; // Your axios instance

// Async thunk to fetch open lots for a specific ticker
export const fetchOpenLots = createAsyncThunk(
  'portfolio/fetchOpenLots',
  async (ticker, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/strategy/open-inventory/${ticker}`);
      return res.data; 
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchPortfolioOverview = createAsyncThunk(
    'portfolio/fetchOverview',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/strategy/portfolio-overview');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
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
    portfolioData: []
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
      })
      .addCase(fetchPortfolioOverview.fulfilled, (state, action) => {
            state.portfolioData = action.payload;
            state.loading = false;
        });
  },
});

export const { setTicker, updateMetrics } = portfolioSlice.actions;
export default portfolioSlice.reducer;