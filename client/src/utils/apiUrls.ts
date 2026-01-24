const API_BASE = import.meta.env.VITE_API_URL || '';

export const API_URLS = {
  ZERODHA_URL: `${API_BASE}/api/auth/zerodha-url`,
  MARKET_STATUS: `${API_BASE}/api/market/status`,
  TODAY_ORDERS: `${API_BASE}/api/market/todays-orders`,
  BATCH_DETAILS: `${API_BASE}/api/batches/batch/`,
  BATCHES: `${API_BASE}/api/batches/batches`,
  UNBATCHED: `${API_BASE}/api/batches/unbatched`,
  CREATE_BATCH: `${API_BASE}/api/batches/create`,
  STOCKS: `${API_BASE}/api/stocks`,
  OPEN_INVENTORY: `${API_BASE}/api/strategy/open-inventory/`,
  QUOTES: `${API_BASE}/api/market/quotes?symbols=`,
  ACTIVE_TICKERS: `${API_BASE}/api/market/active-tickers`,
  TRANSACTIONS: `${API_BASE}/api/transactions`,
  SYNCED_STATUS: `${API_BASE}/api/transactions/synced-status`,
  // OPEN_LOTS: `${API_BASE}/api/transactions/open-lots`,
  OPEN_LOTS: `${API_BASE}/api/openLots`
}