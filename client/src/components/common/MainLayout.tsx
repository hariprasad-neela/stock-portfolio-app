import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ZerodhaManager } from '../../features/market/ZerodhaManager';

export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 min-h-0"> {/* The 'min-h-0' is the secret fix for Recharts */}
        {/* Global Zerodha Status: Visible on every page */}
        <ZerodhaManager />
        
        {/* This is where LiveTrackerPage, InventoryPage, etc. will render */}
        <section className="mt-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
};