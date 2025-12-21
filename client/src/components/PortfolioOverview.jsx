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

    return (
        <div className="p-6 space-y-8">
            {/* Top Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Invested" value={`₹${totals.invested.toLocaleString()}`} color="text-slate-900" />
                <SummaryCard title="Total Profit" value={`₹${totals.profit.toLocaleString()}`} color="text-emerald-600" />
                <SummaryCard title="Net Return" value={`${profitPercentage}).toFixed(2)}%`} color="text-emerald-600" />
            </div>

            {/* Ticker Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {portfolioData.map((stock) => {
                    const profitPct = 2.5; // Placeholder for (CMP - avg) / avg
                    const profitAmt = (stock.total_invested * (profitPct / 100));

                    return (
                        <div key={stock.ticker} className={`p-5 rounded-3xl border-2 transition-all hover:scale-105 ${getCardColor(profitPct)}`}>
                            <h3 className="text-xl font-black mb-1">{stock.ticker}</h3>
                            <div className="text-xs font-bold opacity-70 uppercase tracking-wider mb-4">Open Inventory</div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Invested:</span>
                                    <span className="font-bold">₹{parseFloat(stock.total_invested).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Profit:</span>
                                    <span className="font-bold">₹{profitAmt.toFixed(0)}</span>
                                </div>
                                <div className="text-right text-lg font-black mt-2">
                                    {profitPct > 0 ? '+' : ''}{profitPct}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, color }) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
);

export default PortfolioOverview;