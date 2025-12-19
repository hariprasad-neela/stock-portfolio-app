// client/src/constants.js

export const SUPPORTED_STOCKS = [
    { ticker: 'ALPHAETF', name: 'Alpha ETF' },
    { ticker: 'ALPL30IETF', name: 'ALPL 30 I ETF' },
    { ticker: 'CPSEETF', name: 'CPSE ETF' },
    { ticker: 'GOLDBEES', name: 'Gold ETF' },
    { ticker: 'MOM30IETF', name: 'Momentum 30 ETF' },
    { ticker: 'NIFTYQLITY', name: 'Nifty Quality ETF' },
    { ticker: 'NV20IETF', name: 'NV 20 I ETF' },
    { ticker: 'SILVERBEES', name: 'Silver ETF' }
];

export const APP_CONFIG = {
    ITEMS_PER_PAGE: 10,
    MIN_PROFIT_TARGET: 3.0, // Used for the "SELL NOW" logic
    PORTFOLIO_ID: '75d19a27-a0e2-4f19-b223-9c86b16e133e'
};