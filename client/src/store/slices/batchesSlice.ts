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
      });
  },
});

export default batchesSlice.reducer;