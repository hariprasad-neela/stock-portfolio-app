import React from 'react';

export const HistoryPage = () => {
  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <section className="bg-black text-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(254,240,138,1)]">
        <h1 className="text-5xl font-black uppercase tracking-tighter">
          Archive <span className="text-yellow-400">&</span> History
        </h1>
        <p className="mt-2 font-bold text-gray-400 uppercase tracking-widest">
          Performance Tracking • Realized Gains • Closed Cycles
        </p>
      </section>

      {/* STATS GRID PLACEHOLDER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Realized', value: '₹0.00', color: 'bg-white' },
          { label: 'Completed Batches', value: '0', color: 'bg-white' },
          { label: 'Avg. Cycle Time', value: '0 Days', color: 'bg-white' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <p className="text-xs font-black uppercase text-gray-500">{stat.label}</p>
            <p className="text-3xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* DATA TABLE PLACEHOLDER */}
      <section className="bg-white border-4 border-black min-h-[400px] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="text-center z-10">
            <div className="inline-block bg-yellow-400 border-2 border-black px-4 py-1 mb-4 font-black uppercase text-sm rotate-[-2deg]">
              Development in Progress
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-black opacity-20">
              No Closed Batches Found
            </h2>
          </div>
        </div>
        
        {/* Skeleton Table Header */}
        <div className="border-b-4 border-black bg-gray-100 p-4 grid grid-cols-4 font-black uppercase text-xs">
          <span>Batch ID</span>
          <span>Asset</span>
          <span>Exit Date</span>
          <span className="text-right">Profit/Loss</span>
        </div>
      </section>
    </div>
  );
};