// client/src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
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
  },
});

export const { openAddModal, openEditModal, openBulkSellModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;