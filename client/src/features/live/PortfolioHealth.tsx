/* A high-contrast header component for LiveTrackerPage */
export const PortfolioHealth = ({ analytics }) => {
  const totals = analytics.reduce((acc, curr) => ({
    cost: acc.cost + curr.totalCost,
    marketValue: acc.marketValue + curr.size,
  }), { cost: 0, marketValue: 0 });

  const totalRoi = ((totals.marketValue - totals.cost) / totals.cost) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-xs font-black uppercase text-gray-400">Total Portfolio Value</p>
        <p className="text-3xl font-black">₹{totals.marketValue.toLocaleString()}</p>
      </div>
      <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-xs font-black uppercase text-gray-400">Net Unrealized ROI</p>
        <p className={`text-3xl font-black ${totalRoi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {totalRoi >= 0 ? '+' : ''}{totalRoi.toFixed(2)}%
        </p>
      </div>
      <div className="border-4 border-black p-4 bg-cyan-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-xs font-black uppercase">Top Opportunity</p>
        <p className="text-xl font-black italic underline uppercase">
          {/* We find the ticker with the lowest vsLowest value */}
          {analytics.sort((a, b) => a.vsLowest - b.vsLowest)[0]?.name || 'N/A'}
        </p>
      </div>
    </div>
  );
};