// client/src/App.jsx
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from './store/slices/uiSlice';
import TransactionForm from './components/TransactionForm';
import StrategyDashboard from './components/StrategyDashboard';

const App = () => {
  const { isModalOpen } = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ... Navigation / Sidebar ... */}
      
      <main className="p-4 md:p-8">
        <StrategyDashboard />
      </main>

      {/* Global Modal managed by Redux */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <TransactionForm onClose={() => dispatch(closeModal())} />
          </div>
        </div>
      )}
    </div>
  );
};