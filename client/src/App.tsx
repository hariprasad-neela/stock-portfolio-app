import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MainLayout } from './components/common/MainLayout';
import { fetchStocks } from './store/slices/stocksSlice';
import { fetchOpenTrades } from './store/slices/tradesSlice';

// Page Imports (Ensure filenames match your recent renames)
import { LiveTrackerPage } from './pages/LiveTrackerPage';
import { InventoryPage } from './pages/InventoryPage';
import { BatchesPage } from './pages/BatchesPage';
import { HistoryPage } from './pages/HistoryPage';

const App = () => {
  const dispatch = useDispatch();
  const stocksStatus = useSelector((state) => state.stocks.status);
  const tradesStatus = useSelector((state) => state.trades.status);

  useEffect(() => {
    if (stocksStatus === 'idle') {
      dispatch(fetchStocks());
    }
    if (tradesStatus === 'idle') {
      dispatch(fetchOpenTrades());
    }
  }, [dispatch, stocksStatus, tradesStatus]);

  return (
    <BrowserRouter>
      <Routes>
        {/* All routes inside MainLayout will share the Navbar and ZerodhaManager */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Default view: Live Tracker (formerly strategyDashboard) */}
          <Route index element={<LiveTrackerPage />} />
          
          {/* Inventory Workbench */}
          <Route path="inventory" element={<InventoryPage />} />
          
          {/* Batch Management */}
          <Route path="batches" element={<BatchesPage />} />

          {/* Historical Performance */}
          <Route path="history" element={<HistoryPage />} />
          
          {/* Fallback to Tracker */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;