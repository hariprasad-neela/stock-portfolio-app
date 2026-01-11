const API_BASE = import.meta.env.VITE_API_URL || '';

export const API_URLS = {
  MARKET_STATUS: `${API_BASE}/api/market/status`,
  BATCH_DETAILS: `${API_BASE}/api/batches/batch/`,
  BATCHES: `${API_BASE}/api/batches/batches`,
}