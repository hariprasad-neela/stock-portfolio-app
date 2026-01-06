export const calculatePortfolioAnalytics = (rawLots: any[], liveData: any) => {
  if (!rawLots || rawLots.length === 0 || !liveData) return [];

  const groups: Record<string, any> = {};

  rawLots.forEach((lot) => {
    const ticker = lot.ticker;
    const instrumentKey = `NSE:${ticker}`;
    const quote = liveData[instrumentKey] || {};
    
    const ltp = Number(quote.last_price) || 0;
    const qty = Number(lot.quantity) || 0;
    const cost = Number(lot.price) || 0;
    const prevClose = Number(quote.ohlc?.close) || 0;

    if (!groups[ticker]) {
      groups[ticker] = { 
        name: ticker, 
        totalCost: 0, 
        totalQty: 0, 
        currentPrice: ltp,
        dayChangePct: prevClose > 0 ? ((ltp - prevClose) / prevClose) * 100 : 0,
        lowestBuyPrice: cost,
        latestBuyPrice: cost,
        lots: []
      };
    }

    const lotRoi = cost > 0 ? ((ltp - cost) / cost) * 100 : 0;

    groups[ticker].totalCost += (cost * qty);
    groups[ticker].totalQty += qty;
    groups[ticker].currentPrice = ltp;
    
    // Add lot-level detail for the heatmap
    groups[ticker].lots.push({
      ...lot,
      roi: lotRoi,
      ltp: ltp
    });

    if (cost < groups[ticker].lowestBuyPrice) groups[ticker].lowestBuyPrice = cost;
    groups[ticker].latestBuyPrice = cost;
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
