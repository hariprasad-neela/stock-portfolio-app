# Changelog - Trading Strategy Ledger

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-19
### "The Inventory Foundation"

#### 🚀 High-Level Functionality
- **Core Ledger System**: Complete CRUD operations for trading transactions (Buy/Sell).
- **FIFO/Lot Matching Engine**: Implementation of `transaction_links` to map specific Sell orders to their corresponding Buy lots using UUIDs.
- **Dynamic Inventory Tracker**: Real-time view of "Open Lots" that filters based on active holdings.
- **Bulk Execution**: Ability to select multiple Buy lots and close them simultaneously via a single Sell action.

#### 🎨 UI/UX Improvements
- **Premium Dashboard Layout**: High-contrast Slate/Blue design system with responsive "Stack-to-Row" grid for mobile compatibility.
- **Refined Modal Form**: Centered, blurred-overlay transaction panel with locked fields (Ticker/Qty) during bulk-sell workflows.
- **Market Control Center**: Dual-input header in the inventory section for **Live Market Price** and **Exit Target Price** inputs.

#### 📊 Financial Logic
- **Real-time Profit Projections**: Instant calculation of Unrealized P&L, Total Invested Value, and Current Market Value.
- **Target Analysis**: "Target Upside" projection showing potential profit percentage if Exit Price is hit.
- **Weighted Average Costing**: Automatic calculation of break-even points for selected lots.

#### 🛠️ Technical Stack (V1.0)
- **Frontend**: React (Hooks, UseMemo), Tailwind CSS (Responsive Design).
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL (UUID Primary Keys, Foreign Key Mapping Tables, ACID Transactions).