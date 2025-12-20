// client/src/App.jsx
import { useSelector, useDispatch } from 'react-redux';
import TransactionForm from './components/TransactionForm';
import StrategyDashboard from './components/StrategyDashboard';
import { VIEWS } from './store/slices/uiSlice';
import Navbar from './components/Navbar';
import LedgerPage from './components/LedgerPage'; // The new component!

const App = () => {
  const { currentView, isModalOpen } = useSelector((state) => state.ui);

return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto">
        {currentView === VIEWS.DASHBOARD ? (
          <StrategyDashboard />
        ) : (
          <LedgerPage />
        )}
      </main>

      {/* Global Modals remain accessible from both views */}
      {isModalOpen && <TransactionForm />}
    </div>
  );
};

export default App