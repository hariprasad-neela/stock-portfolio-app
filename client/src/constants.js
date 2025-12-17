// client/src/constants.js

export const SUPPORTED_STOCKS = [
    { ticker: 'SILVERBEES', name: 'Silver ETF' },
    { ticker: 'GOLDBEES', name: 'Gold ETF' },
    { ticker: 'FMCGIETF', name: 'Nifty 50 ETF' },
    { ticker: 'CBSEETF', name: 'Liquid ETF' }
];

export const APP_CONFIG = {
    ITEMS_PER_PAGE: 10,
    MIN_PROFIT_TARGET: 3.0, // Used for the "SELL NOW" logic
    PORTFOLIO_ID: '75d19a27-a0e2-4f19-b223-9c86b16e133e'
};