// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './slices/portfolioSlice';
import uiReducer from './slices/uiSlice';
import ledgerReducer from './slices/ledgerSlice';

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
    ui: uiReducer,
    ledger: ledgerReducer,
  },
});