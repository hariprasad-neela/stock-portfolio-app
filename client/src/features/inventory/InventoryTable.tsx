import React from 'react';
import { uiTheme } from '../../theme/uiTheme';
import { OpenLot } from '../../types';

interface Props {
  lots: OpenLot[];
  selectedIds: string[];
  onToggleLot: (id: string) => void;
}

export const InventoryTable: React.FC<Props> = ({ lots, selectedIds = [], onToggleLot }) => {
console.log("Rendering InventoryTable with lots:", lots);
  return (
    <div className={uiTheme.tableWrapper}>
      <table className={uiTheme.table}>
        <thead>
          <tr className="bg-gray-50">
            <th className={uiTheme.tableHeader + " w-12 text-center"}>Select</th>
            <th className={uiTheme.tableHeader}>Transaction ID</th>
            <th className={uiTheme.tableHeader}>Date</th>
            <th className={uiTheme.tableHeader + " text-right"}>Qty</th>
            <th className={uiTheme.tableHeader + " text-right"}>Buy Price</th>
            <th className={uiTheme.tableHeader + " text-right"}>Total Cost</th>
            <th className={uiTheme.tableHeader + " text-center"}>Status</th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => {
            const isSelected = selectedIds.includes(lot.transaction_id);
            const totalCost = lot.quantity * lot.price;

            return (
              <tr 
                key={lot.transaction_id} 
                className={`${uiTheme.tableRow} ${isSelected ? 'bg-blue-50/50' : ''}`}
                onClick={() => onToggleLot(lot.transaction_id)}
              >
                <td className="p-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    readOnly
                    className="w-4 h-4 border-2 border-black accent-black rounded-none"
                  />
                </td>
                <td className={uiTheme.tableCell}>
                  <code className="text-[10px] bg-gray-100 px-1 border border-gray-300">
                    {lot.transaction_id.split('-')[0]}...
                  </code>
                </td>
                <td className={uiTheme.tableCell}>{lot.date}</td>
                <td className={uiTheme.tableCell + " text-right font-black"}>
                  {lot.quantity}
                </td>
                <td className={uiTheme.tableCell + " text-right"}>
                  ₹{lot.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className={uiTheme.tableCell + " text-right font-black"}>
                  ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className={uiTheme.tableCell + " text-center"}>
                  <span className={uiTheme.badge + " bg-white"}>
                    Available
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;