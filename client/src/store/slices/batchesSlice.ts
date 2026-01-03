import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

// Thunk to fetch pairs from the new backend endpoint
export const fetchUnbatchedPairs = createAsyncThunk(
  'batches/fetchUnbatched',
  async () => {
    const response = await axios.get(`${API_BASE}/api/batches/unbatched`);
    return response.data;
  }
);

// src/store/batchesSlice.ts

export const createBatch = createAsyncThunk(
  'batches/createBatch',
  async (payload: { batch_name: string; batch_date: string; transaction_ids: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/batches/create`, payload);
      return response.data;
    } catch (err: any) {
      // Return the error message from the backend if available
      return rejectWithValue(err.response?.data?.error || "Failed to create batch");
    }
  }
);

const batchesSlice = createSlice({
  name: 'batches',
  initialState: {
    unbatchedPairs: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnbatchedPairs.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUnbatchedPairs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.unbatchedPairs = action.payload;
      })
      .addCase(fetchUnbatchedPairs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createBatch.pending, (state) => { state.isSubmitting = true; })
      .addCase(createBatch.fulfilled, (state) => { state.isSubmitting = false; });
  },
});

export default batchesSlice.reducer;