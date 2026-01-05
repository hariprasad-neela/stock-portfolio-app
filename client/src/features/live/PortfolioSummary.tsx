export const PortfolioSummary = ({ data }: { data: any[] }) => {
  const sorted = [...data].sort((a, b) => b.roi - a.roi);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-green-400 border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <p className="font-black uppercase text-xs opacity-70">Top Performer</p>
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-black">{top?.name || "---"}</h3>
          <p className="text-3xl font-black">{top?.roi.toFixed(2)}%</p>
        </div>
      </div>
      <div className="bg-red-400 border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <p className="font-black uppercase text-xs opacity-70">Worst Performer</p>
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-black">{bottom?.name || "---"}</h3>
          <p className="text-3xl font-black">{bottom?.roi.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};