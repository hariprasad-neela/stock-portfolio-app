import { uiTheme } from '../../theme/uiTheme';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={uiTheme.nav.bar}>
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className={uiTheme.nav.logo}>StockTracker</h1>
        
        {/* Desktop */}
        <div className="hidden md:flex gap-8">
          <NavLink to="/history" className={uiTheme.nav.desktopLink}>History</NavLink>
          <NavLink to="/inventory" className={uiTheme.nav.desktopLink}>Inventory</NavLink>
          <NavLink to="/batches" className={uiTheme.nav.desktopLink}>Batches</NavLink>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className={uiTheme.nav.mobileToggle}>
          {isOpen ? 'Close [X]' : 'Menu [=]'}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className={uiTheme.nav.mobileOverlay}>
          <NavLink to="/history" onClick={() => setIsOpen(false)} className={uiTheme.nav.mobileLink}>History</NavLink>
          <NavLink to="/inventory" onClick={() => setIsOpen(false)} className={uiTheme.nav.mobileLink}>Inventory</NavLink>
          <NavLink to="/batches" onClick={() => setIsOpen(false)} className={uiTheme.nav.mobileLink}>Batches</NavLink>
        </div>
      )}
    </nav>
  );
};