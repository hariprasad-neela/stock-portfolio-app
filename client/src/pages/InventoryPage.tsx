import React, { useState, useEffect } from 'react';
import { LotSelectorCard } from '../features/inventory/LotSelectorCard';
import { InventorySummary } from '../features/inventory/InventorySummary';
import { uiTheme } from '../theme/uiTheme';
import { useLocation } from 'react-router-dom';

export const InventoryPage = () => {
    const [availableTickers, setAvailableTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState('');
    const [lots, setLots] = useState([]);
    const [selectedLotIds, setSelectedLotIds] = useState([]);
    const [cmp, setCmp] = useState(0);
    const [loading, setLoading] = useState(false);

    const location = useLocation(); // Access the navigation state
    const API_BASE = import.meta.env.VITE_API_URL || '';

    // 1. Initial Load: Get allowed tickers
    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/market/active-tickers`);
                const data = await res.json();
                setAvailableTickers(data);

                // CHECK FOR INCOMING TICKER FROM NAVIGATION
                if (location.state?.ticker) {
                    setSelectedTicker(location.state.ticker);
                }
            } catch (err) {
                console.error("Failed to load ticker list");
            }
        };
        fetchTickers();
    }, [API_BASE]);

    // 2. Selection Trigger: Fetch Lots & CMP
    useEffect(() => {
        if (!selectedTicker) {
            setLots([]);
            setCmp(0);
            setSelectedLotIds([]);
            return;
        }

        const loadTickerData = async () => {
            setLoading(true);
            try {
                const [invRes, priceRes] = await Promise.all([
                    fetch(`${API_BASE}/api/strategy/open-inventory/${selectedTicker}`),
                    fetch(`${API_BASE}/api/market/quotes?symbols=NSE:${selectedTicker}`)
                ]);

                const invData = await invRes.json();
                const priceData = await priceRes.json();

                // FIX: Extract last_price from the nested Zerodha object
                const tickerKey = `NSE:${selectedTicker}`;
                const livePrice = priceData[tickerKey]?.last_price || 0;

                setLots(invData);
                setCmp(livePrice);
            } catch (err) {
                console.error("Error loading ticker details:", err);
            } finally {
                setLoading(false);
            }
        };

        loadTickerData();
    }, [selectedTicker, API_BASE]);

    // CALCULATIONS (Moved inside useMemo for performance if needed, but fine here)
    const selectedLotsData = lots.filter(lot => selectedLotIds.includes(lot.transaction_id));
    
    const totalCost = selectedLotsData.reduce((acc, lot) => 
        acc + (parseFloat(lot.price) * parseFloat(lot.quantity)), 0
    );
    
    const currentVal = selectedLotsData.reduce((acc, lot) => 
        acc + (cmp * parseFloat(lot.quantity)), 0
    );

    const currentQuantity = selectedLotsData.reduce((acc, lot) => 
        acc + parseFloat(lot.quantity), 0
    );
    
    const profitAmt = currentVal - totalCost;
    const profitPct = totalCost > 0 ? (profitAmt / totalCost) * 100 : 0;
    
    // Using your strategy threshold
    const isTargetMet = profitPct >= 3.0;

    return (
        <div className={uiTheme.layout.container}>
            <div className="flex justify-between items-center mb-8">
                <h1 className={uiTheme.text.h1}>
                    Open Inventory
                    {loading && <span className="ml-4 text-sm normal-case font-bold animate-pulse text-yellow-600">Updating Prices...</span>}
                </h1>
                {selectedLotIds.length > 0 && (
                    <button className={`${uiTheme.button.primary} bg-black text-white px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black transition-all`}>
                        Batch Selected ({selectedLotIds.length})
                    </button>
                )}
            </div>

            {/* TICKER SELECTOR */}
            <div className="relative mb-8">
                <select
                    value={selectedTicker}
                    onChange={(e) => {
                        setSelectedTicker(e.target.value);
                        setSelectedLotIds([]); // Reset selection when ticker changes
                    }}
                    className="w-full appearance-none border-4 border-black p-4 font-black uppercase bg-white focus:bg-yellow-50 outline-none cursor-pointer transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                    <option value="">-- SELECT TICKER --</option>
                    {availableTickers.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none font-black text-2xl">
                    {loading ? '⏳' : '▼'}
                </div>
            </div>

            {/* SUMMARY COMPONENT */}
            {selectedTicker && (
                <div className="mb-8">
                    <InventorySummary ticker={selectedTicker} lots={lots} cmp={cmp} />
                </div>
            )}

            <div className={uiTheme.inventory.grid}>
                {/* LOTS LIST */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center bg-black text-white p-2 border-x-4 border-t-4 border-black">
                        <h3 className="font-black uppercase text-sm tracking-widest">Available Lots</h3>
                        {selectedTicker && (
                            <span className="bg-yellow-400 text-black px-2 py-1 text-xs font-black">
                                LIVE: ₹{cmp.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <div className="border-4 border-black p-4 bg-gray-50 min-h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-64 font-black italic text-xl animate-pulse">
                                FETCHING KITE DATA...
                            </div>
                        ) : lots.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {lots.map(lot => (
                                    <LotSelectorCard
                                        key={lot.transaction_id}
                                        lot={lot}
                                        cmp={cmp}
                                        isSelected={selectedLotIds.includes(lot.transaction_id)}
                                        onToggle={() => {
                                            setSelectedLotIds(prev =>
                                                prev.includes(lot.transaction_id) 
                                                    ? prev.filter(i => i !== lot.transaction_id) 
                                                    : [...prev, lot.transaction_id]
                                            );
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-4 border-dashed border-gray-300">
                                <p className="font-black uppercase text-lg">No Inventory Found</p>
                                <p className="text-sm font-bold">Select a ticker to see open buy lots</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR STRATEGY PANEL */}
                <div className="lg:col-span-1">
                    <div className={`sticky top-24 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${isTargetMet ? 'bg-green-400' : 'bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-black uppercase text-2xl italic tracking-tighter">Exit Logic</h3>
                            {isTargetMet && <span className="animate-bounce">🚀</span>}
                        </div>
                        
                        <div className="bg-black text-white text-[10px] font-black uppercase px-2 py-1 inline-block mb-6">
                            Minimum Target: 3.0%
                        </div>

                        <div className="space-y-6 border-t-4 border-black pt-6">
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-xs uppercase text-gray-500">Selected Units</span>
                                <span className="font-black text-xl">{currentQuantity}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-xs uppercase text-gray-500">Selected Value</span>
                                <span className="font-black text-xl">₹{currentVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-bold text-xs uppercase text-gray-500">Profit/Loss</span>
                                <div className="text-right">
                                    <p className={`text-5xl font-black leading-none tracking-tighter ${profitAmt >= 0 ? 'text-black' : 'text-red-600'}`}>
                                        {profitPct.toFixed(2)}%
                                    </p>
                                    <p className="font-black text-sm mt-2">
                                        {profitAmt >= 0 ? '+' : ''}₹{profitAmt.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <button
                                disabled={!isTargetMet || selectedLotIds.length === 0}
                                className={`w-full p-4 font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none ${
                                    isTargetMet && selectedLotIds.length > 0
                                        ? 'bg-black text-white cursor-pointer'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 shadow-none'
                                }`}
                            >
                                {isTargetMet ? 'EXECUTE SELL BATCH' : 'WAIT FOR TARGET'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};