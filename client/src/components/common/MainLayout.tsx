import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ZerodhaManager } from '../../features/market/ZerodhaManager';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F4F4F4] font-mono text-black">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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