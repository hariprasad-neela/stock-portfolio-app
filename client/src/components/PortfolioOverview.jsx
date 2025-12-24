import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPortfolioOverview } from '../store/slices/portfolioSlice';

const PortfolioOverview = () => {
    const { portfolioData, loading } = useSelector(state => state.portfolio); // Assume data is fetched here
    const dispatch = useDispatch();
    useEffect(() => {
        console.log('useEffect triggered to fetch portfolio overview')
        dispatch(fetchPortfolioOverview());
    }, [dispatch]);

    if (loading) return <div className="p-10 text-center">Calculating Portfolio Stats...</div>;

    // Calculate Grand Totals for the Top Bar
    // Inside PortfolioOverview.jsx
    const totals = useMemo(() => {
        return portfolioData.reduce((acc, curr) => {
            const invested = parseFloat(curr.total_invested) || 0;
            // Logic: Unrealized Profit = (Current Price - Avg Price) * Qty
            // Using a placeholder 2.5% for now
            const profit = invested * 0.025;

            return {
                invested: acc.invested + invested,
                profit: acc.profit + profit
            };
        }, { invested: 0, profit: 0 });
    }, [portfolioData]);

    const profitPercentage = totals.invested > 0 ? (totals.profit / totals.invested) * 100 : 0;

    const getCardColor = (pct) => {
        if (pct <= -3) return 'bg-rose-50 border-rose-200 text-rose-700';
        if (pct > -3 && pct < 0) return 'bg-orange-50 border-orange-200 text-orange-700';
        if (pct >= 0 && pct < 3) return 'bg-blue-50 border-blue-200 text-blue-700';
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    };

    const PortfolioOverview = () => {
        const { portfolioData } = useSelector(state => state.portfolio);

        return (
            <div className="p-6">
                <h2 className="text-2xl font-black mb-8">My Portfolio</h2>

                {/* The Container - ensures 3 columns on desktop, 1 on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {portfolioData.map((stock) => (
                        <div
                            key={stock.stock_id}
                            className="bg-white border-[3px] border-slate-900 rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-3xl font-black tracking-tighter">{stock.ticker}</span>
                                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                                    📈
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Units Held</span>
                                    <span className="text-xl font-black">{stock.total_units}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Avg Cost</span>
                                    <span className="text-xl font-black">₹{stock.avg_price}</span>
                                </div>
                            </div>

                            <hr className="my-6 border-slate-100" />

                            <button className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-colors">
                                View Analysis
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
};

const SummaryCard = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
);

export default PortfolioOverview;
