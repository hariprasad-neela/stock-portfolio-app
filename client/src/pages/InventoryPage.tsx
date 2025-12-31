import React, { useState, useEffect } from 'react';
import { LotSelectorCard } from '../features/inventory/LotSelectorCard';
import { InventorySummary } from '../features/inventory/InventorySummary';
import { uiTheme } from '../theme/uiTheme';

export const InventoryPage = () => {
    const [availableTickers, setAvailableTickers] = useState<string[]>([]);
    const [selectedTicker, setSelectedTicker] = useState('');
    const [activeTicker, setActiveTicker] = useState(''); // The ticker we are actually tracking
    const [lots, setLots] = useState([]);
    const [selectedLotIds, setSelectedLotIds] = useState<number[]>([]);
    const [selectedLots, setSelectedLots] = useState<string[]>([]);
    const [cmp, setCmp] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    // 1. Initial Load: Get allowed tickers from stocks table
    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/market/active-tickers`);
                const data = await res.json();
                setAvailableTickers(data);
            } catch (err) {
                console.error("Failed to load ticker list");
            }
        };
        fetchTickers();
    }, [API_BASE]);

    // 2. Selection Trigger: Fetch Lots & CMP only when selectedTicker changes
    useEffect(() => {
        if (!selectedTicker) {
            setLots([]);
            setCmp(0);
            return;
        }

        const loadTickerData = async () => {
            setLoading(true);
            try {
                // Run both requests in parallel for speed
                const [invRes, priceRes] = await Promise.all([
                    fetch(`${API_BASE}/api/strategy/open-inventory/${selectedTicker}`),
                    fetch(`${API_BASE}/api/market/quotes?symbols=NSE:${selectedTicker}`)
                ]);

                const invData = await invRes.json();
                const priceData = await priceRes.json();

                setLots(invData);
                setCmp(priceData[`NSE:${selectedTicker}`] || 0);
            } catch (err) {
                console.error("Error loading ticker details:", err);
            } finally {
                setLoading(false);
            }
        };

        loadTickerData();
    }, [selectedTicker, API_BASE]);

    const toggleLot = (id: string) => {
        setSelectedLots(prev =>
            prev.includes(id) ? prev.filter(lotId => lotId !== id) : [...prev, id]
        );
    };

    // Calculations
    const selectedLotsData = lots.filter(lot => selectedLotIds.includes(lot.transaction_id));
    const totalCost = selectedLotsData.reduce((acc, lot) => acc + (lot.price * lot.quantity), 0);
    const currentVal = selectedLotsData.reduce((acc, lot) => acc + (cmp * lot.quantity), 0);
    const profitAmt = currentVal - totalCost;
    const profitPct = totalCost > 0 ? (profitAmt / totalCost) * 100 : 0;
    const isTargetMet = profitPct >= 3.0;

    return (
        <div className={uiTheme.layout.container}>
            <div className="flex justify-between items-center mb-8">
                <h1 className={uiTheme.text.h1}>Open Inventory
                    {loading && <span className="text-sm normal-case font-bold animate-pulse">Syncing...</span>}
                </h1>
                {selectedLots.length > 0 && (
                    <button className={uiTheme.button.primary}>
                        Batch Selected ({selectedLots.length})
                    </button>
                )}
            </div>

            <div className="relative">
                <select
                    value={selectedTicker}
                    onChange={(e) => setSelectedTicker(e.target.value)}
                    className="w-full appearance-none border-4 border-black p-4 font-black uppercase bg-white focus:bg-yellow-50 outline-none cursor-pointer transition-colors"
                >
                    <option value="">-- SELECT FROM STOCKS TABLE --</option>
                    {availableTickers.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none font-black">
                    {loading ? '⏳' : '▼'}
                </div>
            </div>

            {/* The New Summary Section */}
            {selectedTicker && (
                <InventorySummary ticker={selectedTicker} lots={lots} cmp={cmp} />
            )}

            {/* LOTS DISPLAY AREA */}
            <div className={uiTheme.inventory.grid}>
                {/* LOTS LIST */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black uppercase text-xl">Available Lots</h3>
                        {selectedTicker && <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">CMP: ₹{cmp}</span>}
                    </div>

                    {loading ? (
                        <div className="p-10 text-center font-black animate-pulse uppercase">Syncing with Zerodha...</div>
                    ) : lots.length > 0 ? (
                        lots.map(lot => (
                            <LotSelectorCard
                                key={lot.transaction_id}
                                lot={lot}
                                cmp={cmp}
                                isSelected={selectedLotIds.includes(lot.transaction_id)}
                                onToggle={() => {
                                    setSelectedLotIds(prev =>
                                        prev.includes(lot.transaction_id) ? prev.filter(i => i !== lot.transaction_id) : [...prev, lot.transaction_id]
                                    );
                                }}
                            />
                        ))
                    ) : (
                        <div className="border-2 border-dashed border-gray-400 p-10 text-center text-gray-400 font-bold uppercase">
                            No lots found. Search for a ticker to begin.
                        </div>
                    )}
                </div>

                {/* SIDEBAR SUMMARY */}
                <div className="lg:col-span-1">
                    <div className={`sticky top-24 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500 ${isTargetMet ? 'bg-green-400' : 'bg-white'}`}>
                        <h3 className="font-black uppercase text-2xl mb-2 italic">Strategy</h3>
                        <p className="text-[10px] font-black uppercase mb-4 bg-black text-white inline-block px-2">Exit Threshold: 3.0%</p>

                        <div className="space-y-4 border-t-2 border-black pt-4">
                            <div className="flex justify-between font-bold text-sm">
                                <span>Cost Basis:</span>
                                <span>₹{totalCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-sm uppercase">Current P&L:</span>
                                <div className="text-right">
                                    <p className={`text-4xl font-black leading-none ${profitPct >= 0 ? 'text-black' : 'text-red-600'}`}>
                                        {profitPct.toFixed(2)}%
                                    </p>
                                    <p className="font-bold text-sm mt-1">₹{profitAmt.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!isTargetMet}
                            className={`w-full mt-6 p-4 font-black uppercase border-4 border-black transition-all ${isTargetMet ? 'bg-black text-white hover:bg-white hover:text-black active:translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            {isTargetMet ? 'Record Sell Batch' : 'Target Not Met'}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};