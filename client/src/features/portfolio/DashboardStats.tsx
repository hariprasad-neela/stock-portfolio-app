import React from 'react';
import { uiTheme } from '../../theme/uiTheme';

interface StatProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  type: 'success' | 'info' | 'warning';
}

const StatCard: React.FC<StatProps> = ({ label, value, change, isPositive, type }) => {
  const bgClass = 
    type === 'success' ? uiTheme.cardSuccess : 
    type === 'info' ? uiTheme.cardInfo : 
    uiTheme.cardWarning;
  
  return (
    <div className={bgClass}>
      <span className={uiTheme.label}>{label}</span>
      <div className={uiTheme.displayValue}>{value}</div>
      <div className={`text-[11px] font-black mt-3 flex items-center gap-1 ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
        <span className="bg-white border border-black px-1 rounded-sm">
          {isPositive ? '↑' : '↓'}
        </span>
        {change}
      </div>
    </div>
  );
};

export const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <StatCard 
        label="Total Invested" 
        value="₹45,000" 
        change="+₹5,000 this month" 
        isPositive={true} 
        type="info" 
      />
      <StatCard 
        label="Market Value" 
        value="₹48,230" 
        change="+7.18% total gain" 
        isPositive={true} 
        type="success" 
      />
      <StatCard 
        label="Realized Profit" 
        value="₹2,100" 
        change="8 Lots Batched" 
        isPositive={true} 
        type="warning" 
      />
      <StatCard 
        label="Strategy Health" 
        value="Active" 
        change="2 Target hits near" 
        isPositive={true} 
        type="info" 
      />
    </div>
  );
};