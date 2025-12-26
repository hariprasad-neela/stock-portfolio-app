// matches our Database & Glossary
export type TransactionType = 'BUY' | 'SELL';

export interface Asset {
  stock_id: string; // UUID
  ticker: string;
  name?: string;
}

export interface Lot {
  transaction_id: string; // UUID
  stock_id: string;
  portfolio_id: string;
  batch_id: string | null;
  transaction_type: TransactionType;
  quantity: number;
  price_per_unit: number;
  transaction_date: string;
  is_open: boolean;
}

export interface Batch {
  batch_id: string;
  stock_id: string;
  portfolio_id: string;
  batch_name: string;
  target_profit_pct?: number;
  is_closed: boolean;
  created_at: string;
}

// UI State for the "Batch Builder"
export interface BatchSelection {
  selectedLotIds: string[];
  projectedProfit: number;
  projectedTotalValue: number;
}

export interface OpenLot {
  transaction_id: string;
  date: string;
  open_quantity: number;
  buy_price: number;
  ticker: string;
  // We add these for UI state logic
  current_price?: number; 
}
