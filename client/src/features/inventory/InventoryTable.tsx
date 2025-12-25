import React from 'react';
import { uiTheme } from '../../theme/uiTheme';
import { Lot } from '../../types'; // Importing the types we defined earlier

interface InventoryTableProps {
  lots: Lot[];
  onSelectLot: (id: string) => void;
  selectedIds: string[];
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ lots, onSelectLot, selectedIds }) => {
  return (
    <div className={uiTheme.tableWrapper}>
      <table className={uiTheme.table}>
        <thead>
          <tr>
            <th className={uiTheme.tableHeader + " w-12"}>
              {/* Checkbox Header */}
            </th>
            <th className={uiTheme.tableHeader}>Ticker</th>
            <th className={uiTheme.tableHeader}>Date</th>
            <th className={uiTheme.tableHeader}>Qty</th>
            <th className={uiTheme.tableHeader}>Buy Price</th>
            <th className={uiTheme.tableHeader}>Current Value</th>
            <th className={uiTheme.tableHeader}>P&L</th>
            <th className={uiTheme.tableHeader}>Status</th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => {
            const isSelected = selectedIds.includes(lot.transaction_id);
            const profit = (lot.price_per_unit * 1.05) - lot.price_per_unit; // Mock calculation

            return (
              <tr 
                key={lot.transaction_id} 
                className={`${uiTheme.tableRow} ${isSelected ? 'bg-yellow-50' : ''}`}
                onClick={() => onSelectLot(lot.transaction_id)}
              >
                <td className={uiTheme.tableCell}>
                  <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => {}} // Controlled via row click
                    className="w-4 h-4 accent-black border-2 border-black"
                  />
                </td>
                <td className={uiTheme.tableCell}>
                  <span className="bg-black text-white px-2 py-1 text-[10px]">
                    {lot.stock_id.substring(0, 5)} {/* Mock Ticker */}
                  </span>
                </td>
                <td className={uiTheme.tableCell}>
                  {new Date(lot.transaction_date).toLocaleDateString()}
                </td>
                <td className={uiTheme.tableCell}>{lot.quantity}</td>
                <td className={uiTheme.tableCell}>₹{lot.price_per_unit}</td>
                <td className={uiTheme.tableCell}>₹{(lot.price_per_unit * 1.05).toFixed(2)}</td>
                <td className={`${uiTheme.tableCell} ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profit >= 0 ? '+' : ''}₹{profit.toFixed(2)}
                </td>
                <td className={uiTheme.tableCell}>
                  <span className={`${uiTheme.badge} ${lot.is_open ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {lot.is_open ? 'Available' : 'Batched'}
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
