// client/src/App.jsx
import { useSelector, useDispatch } from 'react-redux';
import TransactionForm from './components/TransactionForm';
import LiveTrackerPage from './pages/LiveTrackerPage';
import { VIEWS, closeModal } from './store/slices/uiSlice';
import NavbarOld from './components/NavbarOld';
import LedgerPage from './components/LedgerPage'; // The new component!
import { useEffect } from 'react';
import { fetchStocks } from './store/slices/portfolioSlice';
import PortfolioOverview from './components/PortfolioOverview';
import { uiTheme } from './theme/uiTheme';
import { Navbar } from './components/common/Navbar';
import { DashboardStats } from './features/portfolio/DashboardStats';

const App = () => {
  const { currentView, isModalOpen } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchStocks());
  }, [dispatch]);

  return (
    <div className={uiTheme.wrapper}>
      <Navbar />
      <div className={uiTheme.container}>
        <DashboardStats />
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
          <NavbarOld />

          <main className="max-w-7xl mx-auto">
            {currentView === VIEWS.DASHBOARD && <LiveTrackerPage />}
            {currentView === VIEWS.LEDGER && <LedgerPage />}
            {currentView === VIEWS.OVERVIEW && <PortfolioOverview />}
          </main>

          {/* Global Modals remain accessible from both views */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white rounded-[2.5rem] w-full max-w-2xl">
                {/* Pass a dispatch to the close button inside the form */}
                <TransactionForm onClose={() => dispatch(closeModal())} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App