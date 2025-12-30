import { uiThemeNew } from '../../theme/uiTheme';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={uiThemeNew.nav.bar}>
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className={uiThemeNew.nav.logo}>StockTracker</h1>
        
        {/* Desktop */}
        <div className="hidden md:flex gap-8">
          <NavLink to="/history" className={uiThemeNew.nav.desktopLink}>History</NavLink>
          <NavLink to="/inventory" className={uiThemeNew.nav.desktopLink}>Inventory</NavLink>
          <NavLink to="/batches" className={uiThemeNew.nav.desktopLink}>Batches</NavLink>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className={uiThemeNew.nav.mobileToggle}>
          {isOpen ? 'Close [X]' : 'Menu [=]'}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className={uiThemeNew.nav.mobileOverlay}>
          <NavLink to="/history" onClick={() => setIsOpen(false)} className={uiThemeNew.nav.mobileLink}>History</NavLink>
          <NavLink to="/inventory" onClick={() => setIsOpen(false)} className={uiThemeNew.nav.mobileLink}>Inventory</NavLink>
          <NavLink to="/batches" onClick={() => setIsOpen(false)} className={uiThemeNew.nav.mobileLink}>Batches</NavLink>
        </div>
      )}
    </nav>
  );
};