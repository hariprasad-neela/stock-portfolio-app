// client/src/store/slices/ledgerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

export const fetchLedger = createAsyncThunk(
    'ledger/fetchLedger',
    async ({ page, limit, ticker }) => {
        const response = await api.get(`/api/transactions?page=${page}&limit=${limit}${ticker ? `&ticker=${ticker}` : ''}`);
        return response.data;
    }
);

const ledgerSlice = createSlice({
    name: 'ledger',
    initialState: {
        items: [],
        pagination: { currentPage: 1, totalPages: 1, limit: 10 },
        filters: { ticker: '' },
        loading: false
    },
    reducers: {
        setPage: (state, action) => { state.pagination.currentPage = action.payload; },
        setTickerFilter: (state, action) => { state.filters.ticker = action.payload; state.pagination.currentPage = 1; }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLedger.pending, (state) => { state.loading = true; })
            .addCase(fetchLedger.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = action.payload.pagination;
            });
    }
});

export const { setPage, setTickerFilter } = ledgerSlice.actions;
export default ledgerSlice.reducer;