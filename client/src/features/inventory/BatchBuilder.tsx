import React from 'react';
import { uiTheme } from '../../theme/uiTheme';
import { OpenLot } from '../../types';

interface Props {
  selectedLots: OpenLot[];
  onClear: () => void;
  onCreateBatch: () => void;
}

export const BatchBuilder: React.FC<Props> = ({ selectedLots, onClear, onCreateBatch }) => {
  const totalQty = selectedLots.reduce((sum, lot) => sum + lot.quantity, 0);
  const totalCost = selectedLots.reduce((sum, lot) => sum + (lot.quantity * lot.price), 0);
  const avgPrice = totalQty > 0 ? totalCost / totalQty : 0;

  return (
    <div className={uiTheme.sidebar}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-black uppercase text-sm italic">Strategy Builder</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
            {selectedLots.length} Lots Selected
          </p>
        </div>
        {selectedLots.length > 0 && (
          <button onClick={onClear} className="text-[10px] font-black uppercase underline hover:text-red-600">
            Clear
          </button>
        )}
      </div>

      <div className={uiTheme.metricBox}>
        <span className={uiTheme.metricLabel}>Aggregate Quantity</span>
        <div className={uiTheme.metricValue}>{totalQty} Units</div>
      </div>

      <div className={uiTheme.metricBox}>
        <span className={uiTheme.metricLabel}>Total Exposure (Cost)</span>
        <div className={uiTheme.metricValue}>
          ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className={uiTheme.metricBox}>
        <span className={uiTheme.metricLabel}>Weighted Avg Price</span>
        <div className={uiTheme.metricValue}>
          ₹{avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className={uiTheme.divider} />

      <button 
        disabled={selectedLots.length === 0}
        onClick={onCreateBatch}
        className={`${uiTheme.btnPrimary} w-full py-4 text-xs ${selectedLots.length === 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
      >
        Execute Selective Batch
      </button>

      <p className="mt-4 text-[9px] text-gray-400 font-medium leading-tight">
        *Executing this will link selected lots to a new strategy batch for profit tracking.
      </p>
    </div>
  );
};

export default BatchBuilder;
