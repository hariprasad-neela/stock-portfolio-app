import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/common/MainLayout';

// Page Imports (Ensure filenames match your recent renames)
import { LiveTrackerPage } from './pages/LiveTrackerPage';
import { InventoryPage } from './pages/InventoryPage';
import { HistoryPage } from './pages/HistoryPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* All routes inside MainLayout will share the Navbar and ZerodhaManager */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Default view: Live Tracker (formerly strategyDashboard) */}
          <index element={<LiveTrackerPage />} />
          
          {/* Inventory Workbench */}
          <Route path="inventory" element={<InventoryPage />} />
          
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