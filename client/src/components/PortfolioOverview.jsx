import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPortfolioOverview } from '../store/slices/portfolioSlice';

const PortfolioOverview = () => {
    // 1. Ensure we select the right state and provide a fallback empty array
    const { portfolioData, loading } = useSelector(state => state.portfolio) || { portfolioData: [] };

    // 2. Loading State
    if (loading) return <div className="p-10 font-black">Loading Portfolio...</div>;

    // 3. Empty State Check
    if (!portfolioData || portfolioData.length === 0) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-2xl font-black text-slate-300">No holdings found.</h2>
                <p className="text-slate-400">Add a transaction in the Ledger to see your overview.</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolioData.map((stock) => (
                    // 4. Key Check: Ensure stock exists before rendering
                    <div key={stock.stock_id || stock.ticker} className="...">
                        <h3 className="text-2xl font-black">{stock.ticker}</h3>
                        <p>Units: {stock.total_units || 0}</p>
                        <p>Avg: ₹{stock.avg_price || 0}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default PortfolioOverview;
