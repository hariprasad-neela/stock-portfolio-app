// client/src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const VIEWS = {
    DASHBOARD: 'DASHBOARD',
    LEDGER: 'LEDGER',
    OVERVIEW: 'OVERVIEW'
};

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        currentView: VIEWS.DASHBOARD, // Default view
        isModalOpen: false,
        modalMode: 'ADD', // 'ADD', 'EDIT', or 'BULK_SELL'
        editData: null,
        bulkSellData: null,
        editingTransaction: null,
    },
    reducers: {
        openModal: (state, action) => {
            state.isModalOpen = true;
            state.editingTransaction = action.payload || null; // If payload exists, we are editing
        },
        closeModal: (state) => {
            state.isModalOpen = false;
            state.editingTransaction = null;
        },
        setView: (state, action) => {
            console.log('Setting view to:', action.payload);
            state.currentView = action.payload;
        },
    },
});

export const { openModal, closeModal, setView } = uiSlice.actions;
export default uiSlice.reducer;