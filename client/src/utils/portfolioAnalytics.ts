export const calculatePortfolioAnalytics = (rawLots: any[], liveData: any) => {
    if (!rawLots || rawLots.length === 0 || !liveData) return [];

    const groups: Record<string, any> = {};
    // Inside your useMemo before the forEach
    const sortedLots = [...rawLots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedLots.forEach((lot) => {
        const ticker = lot.ticker;
        const instrumentKey = `NSE:${ticker}`;
        const quote = liveData[instrumentKey] || {};

        const ltp = Number(quote.last_price) || 0;
        const qty = Number(lot.quantity) || 0;
        const cost = Number(lot.price) || 0;
        const prevClose = Number(quote.ohlc?.close) || 0;

        // Ensure we treat the price as a high-precision float immediately
        const lotPrice = parseFloat(lot.price);

        if (!groups[ticker]) {
            groups[ticker] = {
                name: ticker,
                totalCost: 0,
                totalQty: 0,
                // Initialize with the FIRST lot's price to avoid rounding offsets
                lowestBuyPrice: lotPrice,
                latestBuyPrice: lotPrice,
                lots: []
            };
        }

        const lotRoi = cost > 0 ? ((ltp - cost) / cost) * 100 : 0;

        // UPDATE: Use Math.min for lowest to maintain decimal precision
        groups[ticker].lowestBuyPrice = Math.min(groups[ticker].lowestBuyPrice, lotPrice);

        // UPDATE: Ensure Latest is the most recent lot processed
        groups[ticker].latestBuyPrice = lotPrice;

        groups[ticker].totalCost += (cost * qty);
        groups[ticker].totalQty += qty;
        groups[ticker].currentPrice = ltp;

        // Add lot-level detail for the heatmap
        groups[ticker].lots.push({
            ...lot,
            roi: lotRoi,
            ltp: ltp
        });

        // if (cost < groups[ticker].lowestBuyPrice) groups[ticker].lowestBuyPrice = cost;
        // groups[ticker].latestBuyPrice = cost;
    });

    return Object.values(groups).map((g: any) => {
        const marketValue = g.currentPrice * g.totalQty;
        const wap = g.totalCost / g.totalQty;
        return {
            ...g,
            size: marketValue || 1,
            roi: g.totalCost > 0 ? ((marketValue - g.totalCost) / g.totalCost) * 100 : 0,
            wap: wap,
            vsWap: wap > 0 ? ((g.currentPrice - wap) / wap) * 100 : 0,
            vsLowest: g.lowestBuyPrice > 0 ? ((g.currentPrice - g.lowestBuyPrice) / g.lowestBuyPrice) * 100 : 0,
            vsLatest: g.latestBuyPrice > 0 ? ((g.currentPrice - g.latestBuyPrice) / g.latestBuyPrice) * 100 : 0
        };
    });
};
