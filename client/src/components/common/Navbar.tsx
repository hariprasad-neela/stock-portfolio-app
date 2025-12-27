import React from 'react';
import { NavLink } from 'react-router-dom';

export const Navbar = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `px-4 py-2 border-2 border-black font-black uppercase transition-all ${
      isActive ? 'bg-yellow-400 shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100'
    }`;

  return (
    <nav className="border-b-4 border-black bg-white p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-black tracking-tighter italic">
          BATCH<span className="text-yellow-400">.</span>PRO
        </div>
        
        <div className="flex gap-6">
          <NavLink title="Strategy Dashboard" to="/" className={linkClass}>Dashboard</NavLink>
          <NavLink title="Inventory Management" to="/inventory" className={linkClass}>Inventory</NavLink>
          <NavLink title="Trade History" to="/history" className={linkClass}>History</NavLink>
        </div>
      </div>
    </nav>
  );
};