import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export const Navbar = () => {
  const activeStyle = "bg-yellow-400 translate-x-[2px] translate-y-[2px] shadow-none";
  const inactiveStyle = "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50";

  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-6 py-2 border-2 border-black font-black uppercase text-sm transition-all ${isActive ? activeStyle : inactiveStyle
    }`;

  return (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="text-3xl font-black tracking-tighter italic">
          BATCH<span className="text-yellow-400">.</span>PRO
        </div>

        <nav className="flex gap-8 font-black uppercase tracking-tighter">
          <Link to="/" className="hover:text-yellow-400">Tracker</Link>
          <Link to="/inventory" className="hover:text-yellow-400">Inventory</Link>
          <Link to="/batches" className="hover:text-yellow-400 text-blue-600 underline decoration-4">Batches</Link>
          <Link to="/history" className="hover:text-yellow-400">History</Link>
        </nav>
      </div>
    </nav>
  );
};