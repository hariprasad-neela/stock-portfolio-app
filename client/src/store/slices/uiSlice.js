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
  },
  reducers: {
    openAddModal: (state) => {
      state.modalMode = 'ADD';
      state.editData = null;
      state.bulkSellData = null;
      state.isModalOpen = true;
    },
    openEditModal: (state, action) => {
      state.modalMode = 'EDIT';
      state.editData = action.payload; // Existing transaction object
      state.bulkSellData = null;
      state.isModalOpen = true;
    },
    openBulkSellModal: (state, action) => {
      state.modalMode = 'BULK_SELL';
      state.bulkSellData = action.payload; // { ticker, selectedBuyIds, quantity }
      state.editData = null;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editData = null;
      state.bulkSellData = null;
    },
    setView: (state, action) => {
      console.log('Setting view to:', action.payload);
      state.currentView = action.payload;
    },
  },
});

export const { openAddModal, openEditModal, openBulkSellModal, closeModal, setView } = uiSlice.actions;
export default uiSlice.reducer;