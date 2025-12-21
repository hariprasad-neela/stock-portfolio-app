// client/src/components/Navbar.jsx
import { useDispatch, useSelector } from 'react-redux';
import { setView, VIEWS, openAddModal } from '../store/slices/uiSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const currentView = useSelector(state => state.ui.currentView);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="flex gap-8">
        <button 
          onClick={() => dispatch(setView(VIEWS.OVERVIEW))}
          className={`pb-2 text-sm font-black transition-all ${currentView === VIEWS.OVERVIEW ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          OVERVIEW
        </button>
        <button 
          onClick={() => dispatch(setView(VIEWS.DASHBOARD))}
          className={`pb-2 text-sm font-black transition-all ${currentView === VIEWS.DASHBOARD ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          DASHBOARD
        </button>
        <button 
          onClick={() => dispatch(setView(VIEWS.LEDGER))}
          className={`pb-2 text-sm font-black transition-all ${currentView === VIEWS.LEDGER ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          LEDGER
        </button>
      </div>
      <button 
        onClick={() => {
        console.log("Add button clicked!"); // Add this to test
        dispatch(openAddModal());
      }}
        className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20"
      >
        + ADD TRADE
      </button>
    </nav>
  );
};

export default Navbar