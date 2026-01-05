import React from 'react';
import { TickerCard } from './TickerCard';

export const TickerGrid = ({ data }: { data: any[] }) => {
    return (
        <section className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black uppercase italic underline decoration-yellow-400 decoration-8 underline-offset-4">
                    Open Positions
                </h2>
                <span className="bg-black text-white px-3 py-1 text-xs font-black rounded-full">
                    {data.length} TICKERS
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.length > 0 ? (
                    data.map((item) => (
                        <TickerCard key={item.name} item={item} />
                    ))
                ) : (
                    <div className="col-span-full border-4 border-black border-dashed p-12 text-center">
                        <p className="font-black text-xl italic text-gray-400 uppercase">
                            No Active Positions Found
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};