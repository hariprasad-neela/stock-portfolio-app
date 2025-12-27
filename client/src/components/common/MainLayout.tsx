import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ZerodhaManager } from '../../features/market/ZerodhaManager';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-mono text-black">
      {/* GLOBAL NAVIGATION */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* GLOBAL CONNECTION STATUS */}
        <ZerodhaManager />

        {/* FEATURE-SPECIFIC CONTENT */}
        <div className="mt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};