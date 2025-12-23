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
                <SummaryCard title="Net Return" value={`${profitPercentage.toFixed(2)}%`} color="text-emerald-600" />
            </div>

            {/* Ticker Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {portfolioData.map((stock) => {
                    const profitPct = 2.5; // Placeholder for (CMP - avg) / avg
                    const profitAmt = (stock.total_invested * (profitPct / 100));

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {portfolioData.map((stock) => (
                                <div key={stock.stock_id} className="p-6 bg-white border-2 border-slate-900 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-2xl font-black">{stock.ticker}</h3>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full uppercase">
                                            Equity
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-bold text-sm">Units Held</span>
                                            <span className="font-black text-lg">{stock.units_held}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500 font-bold text-sm">Avg. Cost</span>
                                            <span className="font-black">₹{parseFloat(stock.avg_buy_price).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
