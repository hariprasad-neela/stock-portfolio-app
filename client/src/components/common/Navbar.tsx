import React from 'react';
import { NavLink } from 'react-router-dom';
import { uiTheme } from '../../theme/uiTheme';

const Navbar: React.FC = () => {
  return (
    <nav className={uiTheme.nav}>
      <div className="flex justify-between items-center h-full max-w-[1600px] mx-auto px-6">
        <div className="flex items-center h-full">
          {/* Brand Logo */}
          <div className="bg-black text-white p-2 font-black text-xl mr-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]">
            S.P
          </div>
          
          {/* Links mapped to Design Doc Glossary */}
          <div className="flex h-full border-l border-black">
            <NavLink 
              to="/" 
              className={({ isActive }) => `${uiTheme.navLink} ${isActive ? 'bg-gray-100' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/inventory" 
              className={({ isActive }) => `${uiTheme.navLink} ${isActive ? 'bg-gray-100' : ''}`}
            >
              Inventory
            </NavLink>
            <NavLink 
              to="/batches" 
              className={({ isActive }) => `${uiTheme.navLink} ${isActive ? 'bg-gray-100' : ''}`}
            >
              Batches
            </NavLink>
            <NavLink 
              to="/ledger" 
              className={({ isActive }) => `${uiTheme.navLink} ${isActive ? 'bg-gray-100' : ''}`}
            >
              Ledger
            </NavLink>
          </div>
        </div>
        
        <div>
          <button className={uiTheme.btnPrimary}>
            New Transaction +
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;