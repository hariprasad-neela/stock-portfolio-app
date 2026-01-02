// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import portfolioReducer from './slices/portfolioSlice';
import uiReducer from './slices/uiSlice';
import ledgerReducer from './slices/ledgerSlice';
import stocksReducer from './slices/stocksSlice';
import tradesReducer from './slices/tradesSlice';
import batchesReducer from './slices/batchesSlice';

export const store = configureStore({
  reducer: {
    portfolio: portfolioReducer,
    ui: uiReducer,
    ledger: ledgerReducer,
    stocks: stocksReducer, 
    trades: tradesReducer,
    batches: batchesReducer,
  },
});