// client/src/store/slices/ledgerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';
import { API_URLS } from '../../utils/apiUrls';

export const fetchLedger = createAsyncThunk(
    'ledger/fetchLedger',
    async ({ page, limit, ticker }, { rejectWithValue }) => {
        try {
            // Use URLSearchParams for clean query strings
            const params = new URLSearchParams({ page, limit });
            if (ticker) params.append('ticker', ticker);

            const response = await api.get(`${API_URLS.TRANSACTIONS}?${params.toString()}`);
            return response.data; // This now contains { data, pagination }
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const removeTransaction = createAsyncThunk(
    'transactions/delete',
    async (id, { dispatch }) => {
        await api.delete(`${API_URLS.TRANSACTIONS}/${id}`);
        return id;
    }
);

export const editTransaction = createAsyncThunk(
    'transactions/update',
    async ({ id, data }) => {
        const response = await api.put(`${API_URLS.TRANSACTIONS}/${id}`, data);
        return response.data;
    }
);

const initialState = {
    items: [],
    loading: false,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        totalRecords: 0
    },
    filters: {
        ticker: '',
        type: ''
    }
};

const ledgerSlice = createSlice({
    name: 'ledger',
    initialState,
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
            }).addCase(removeTransaction.fulfilled, (state, action) => {
                state.items = state.items.filter(tx => tx.transaction_id !== action.payload);
            }).addCase(editTransaction.fulfilled, (state, action) => {
                const index = state.items.findIndex(tx => tx.transaction_id === action.payload.transaction_id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    }
});

export const { setPage, setTickerFilter } = ledgerSlice.actions;
export default ledgerSlice.reducer;