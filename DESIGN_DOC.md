# Design Document: Stock Portfolio App v3.0

**Project URL:** https://stock-portfolio-app-kappa.vercel.app  
**API URL:** https://stock-portfolio-api-f38f.onrender.com

## 1. Executive Summary
This application is a production-grade portfolio management system designed to track and execute a **Selective Batching Strategy**. It treats every investment as a unique ₹5,000 **Lot** and allows for the strategic grouping of these lots into **Batches** to achieve net-profit targets, even when individual lots within the batch are currently at a loss.

## 2. Global Glossary & Mapping (The Shared Language)
To ensure absolute clarity across the Database, Backend logic, and Frontend UI, the following terms are used:

| Term | Scope | DB Mapping | Definition |
| :--- | :--- | :--- | :--- |
| **Portfolio** | Global | `portfolios` table | Portfolio. |
| **Asset** | Global | `stocks` table | The underlying security/ticker (e.g., SILVERBEES). |
| **Unit** | Strategy | `transactions.quantity` | A standardized portion of an asset, typically ₹5,000. |
| **Lot** | Strategy | `transactions` row | A specific purchase record with its own cost basis. |
| **Batch** | Strategy | `batches` table | A logical group linking specific Buy & Sell Lots. |
| **Inventory** | UI/Logic | `transactions (is_open=true)`| The collection of lots currently held and "un-batched." |
| **Ledger** | UI/Logic | `transactions` table | The master historical record of every raw entry. |

---

## 3. Architecture & Standards
- **Frontend:** React (Vite) on Vercel.
- **Backend:** Node.js (Express) on Render.
- **Database:** PostgreSQL on Render (with `app_config` for session persistence).
- **Core Strategy:** Selective Batching (Grouping transactions into to sell at 3% profit).

### 3.1 Folder Structure (Domain-Driven)
The project is organized by **Feature Domains** to ensure high maintainability and professional scalability.



**Frontend (`/client/src`):**
- `components/common/`: Reusable Atomic UI elements (Buttons, Modals, Inputs).
- `features/portfolio/`: Global health overview and aggregated asset cards.
- `features/inventory/`: Open Lot management and Batch Selection logic.
- `features/history/`: Closed Batch analysis and Ledger views.
- `theme/uiTheme.js`: Centralized CSS class aliases for Tailwind styling.
- `store/`: Redux Toolkit configuration organized by feature slices.

**Backend (`/server`):**
- `controllers/`: Request handlers (e.g., `batchController.js`).
- `models/`: Raw SQL queries and business logic abstractions.
- `routes/`: Express route definitions with versioning (e.g., `/api/v3/...`).

### 3.2 Database Schema (Backward Compatible)
The schema maintains Version 2 stability by using nullable columns and new table additions only.

- **Table: `stocks`**: Stores metadata for various Assets.
- **Table: `transactions`**: The core data store.
    - *Added Column:* `batch_id (UUID)` - Nullable; links a lot to a specific Batch.
- **Table: `batches`**: (New) The entity representing a grouped trade strategy.
    - *Columns:* `batch_id`, `stock_id`, `profile_id`, `batch_name`, `is_closed`, `created_at`.

### 3.3 CSS Standards (Class Aliasing)
To prevent "Tailwind Soup," all HTML elements must utilize variables from `uiTheme.js`. This allows for a consistent Neobrutalist design that can be updated globally.

```javascript
// Example from src/theme/uiTheme.js
export const uiTheme = {
  card: "bg-white border-[3px] border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]",
  button: "bg-slate-900 text-white rounded-2xl font-black px-6 py-3 uppercase"
};
```
### 3.4 Reference website for design
https://brutalism.tailwinddashboard.com/index.html

---

## 4. Data Persistence (v3.2)
- `app_config`: Stores Zerodha access tokens for session persistence.
- `stocks`: Configuration table; only tickers where `display = TRUE` are populated in the frontend workbench.
- `transactions`: Raw trade data used to calculate `open_quantity`.
- *Note:* All portfolio-wide views require a JOIN on these two tables.

### 4.1 Selective Batching Workflow

1. **Selection:** User selects  number of "Open Lots" in the Inventory.
2. **Analysis:** UI calculates aggregate cost vs. potential exit profit.
3. **Execution:** Upon "Batch Sell," the system generates  corresponding sell transactions.
4. **Linkage:** All  transactions (Buys + Sells) are tagged with a unique `batch_id`.

### 4.2 Data Integrity (Banking Standards)

* **Atomic Operations:** Batch creation and transaction state updates must occur within a SQL `BEGIN...COMMIT` block.
* **Auditability:** Transactions are never deleted. Their `is_open` status is toggled, and `batch_id` provides the audit trail of the strategy.

---

## 5. Implementation Roadmap (Version 3)

1. **Phase 1 (DB):** Migration to add `batches` table and `batch_id` reference.
2. **Phase 2 (Project):** Directory restructuring and `uiTheme.js` initialization.
3. **Phase 3 (Core):** Batch Selection UI and "Multi-select" sell logic.
4. **Phase 4 (Reporting):** Realized Batch Performance ledger and Strategy Analytics.

```


## 2. API Endpoints
- `GET /api/auth/zerodha-url`: Handshake initiation.
- `GET /api/auth/callback`: Token exchange and DB storage.
- `GET /api/market/status`: Checks if Zerodha session is valid.
- `GET /api/market/quotes`: Live LTP feed.
- `GET /api/strategy/open-inventory/:ticker`: Fetches ungrouped buy transactions.
- `POST /api/batches/create-selective`: Commits selected lots as a new Batch.

## 3. Frontend Component Hierarchy
- `App.tsx`: Router configuration using `BrowserRouter`.
- `MainLayout.tsx`: Master frame containing `Navbar` and `ZerodhaManager`.
- `LiveTrackerPage.tsx`: Real-time P&L monitoring.
- `InventoryPage.tsx`: Workbench for batch construction.
- `HistoryPage.tsx`: Archive of realized gains and historical trades.


## 4. Data Persistence (PostgreSQL)
- `app_config`: Key-value store for persisting `zerodha_access_token` to survive server restarts.
- `transactions`: Historical buy/sell data imported from brokers.
- `batches`: User-defined groups of transactions forming the "Selective Units."

---
*Last Updated: 2025-12-27*



# Design Document: Stock Portfolio App v3.0 (Selective Batching)

**Project URL:** https://stock-portfolio-app-kappa.vercel.app  
**API URL:** https://stock-portfolio-api-f38f.onrender.com

## 1. System Architecture
- **Frontend:** React (Vite) deployed on Vercel.
- **Backend:** Node.js (Express) deployed on Render.
- **Database:** PostgreSQL (Managed) on Render.
- **External API:** Zerodha Kite Connect for live market data.

## 2. API Endpoints Reference

### Authentication (Zerodha)
- `GET /api/auth/zerodha-url`: Returns the OAuth URL to initiate the daily Zerodha session.
- `GET /api/auth/callback`: Handles the redirect from Zerodha, exchanges tokens, and persists the session.

### Market Data
- `GET /api/market/status`: Checks if the server currently has a valid, active Zerodha `access_token`.
- `GET /api/market/quotes?symbols=...`: Returns live Last Traded Price (LTP) for provided NSE symbols.

### Inventory & Strategy
- `GET /api/strategy/open-inventory/:ticker`: Fetches individual open buy lots for a specific stock/ETF.
- `POST /api/batches/create-selective`: Groups specific lots into a "Batch" (target unit ₹5,000) for P&L tracking.

## 3. Frontend Component Structure

### `/src/pages`
- `strategyDashboard.tsx`: The main entry point. Orchestrates the connection status and the dual-column layout.

### `/src/features/market`
- `ZerodhaManager.tsx`: A "Control Module" that manages the daily handshake and connection health visualization.

### `/src/features/inventory`
- `BatchBuilder.tsx`: The primary interface for selecting individual lots to form a ₹5,000 unit.
- `LotSelectorCard.tsx`: Individual lot items with checkboxes and cost-basis calculations.
- `BatchTable.tsx`: Displays existing batches with their aggregate buy price vs live price.

### `/src/features/analytics`
- `ProfitPulse.tsx`: A real-time P&L indicator that calculates gains based on live CMP from the Zerodha feed.

## 4. Data Persistence (PostgreSQL)
- `app_config`: Key-value store for persisting `zerodha_access_token` to survive server restarts.
- `transactions`: Historical buy/sell data imported from brokers.
- `batches`: User-defined groups of transactions forming the "Selective Units."

---
*Last Updated: 2025-12-27*

## 3. Frontend Component Structure (Modular Layout)

### `/src/components/common`
- `MainLayout.tsx`: The master wrapper. Contains the Navbar and the Global Zerodha Status bar.
- `Navbar.tsx`: Brutalist navigation with active-state tracking for different features.

### `/src/pages` (Feature Parents)
- `StrategyDashboard.tsx`: Parent for real-time tracking and batch P&L.
- `InventoryPage.tsx`: Parent for Lot Selection and ₹5,000 unit construction.
- `HistoryPage.tsx`: Parent for closed batches and performance analytics.

### `/src/features` (Domain Specific)
- `market/`: Zerodha connection logic and CMP (Current Market Price) fetching.
- `inventory/`: Core strategy logic for "Selective Batching."
- `analytics/`: Calculations for XIRR and Batch-wise Profit.

## 3. Frontend Component Structure (v3.1 - Refactored)

### `/src/components/common`
- `MainLayout.tsx`: The master shell providing a consistent frame across all views.
- `Navbar.tsx`: High-contrast navigation links: [Tracker, Inventory, History].

### `/src/pages` (Feature Parents)
- `LiveTrackerPage.tsx`: (Formerly `strategyDashboard`) Focuses on active session health and current portfolio P&L.
- `InventoryPage.tsx`: The "Workbench" where users select individual `OpenLot` records to construct new batches.
- `HistoryPage.tsx`: Data-dense view of completed cycles and historical performance.

### `/src/features/inventory`
- `BatchBuilder.tsx`: Logic engine to filter transactions and calculate cumulative cost for selection.
- `LotSelectorCard.tsx`: A "Brutalist" card component representing a single buy transaction.
- `BatchTable.tsx`: Displays active batches with LTP-based market valuation.

# Design Document: Stock Portfolio App v3.0

**Project URL:** https://stock-portfolio-app-kappa.vercel.app  
**API URL:** https://stock-portfolio-api-f38f.onrender.com

## 1. System Architecture
- **Frontend:** React (Vite) on Vercel.
- **Backend:** Node.js (Express) on Render.
- **Database:** PostgreSQL on Render (with `app_config` for session persistence).
- **Core Strategy:** Selective Batching (Grouping transactions into ₹5,000 units).

## 2. API Endpoints
- `GET /api/auth/zerodha-url`: Handshake initiation.
- `GET /api/auth/callback`: Token exchange and DB storage.
- `GET /api/market/status`: Checks if Zerodha session is valid.
- `GET /api/market/quotes`: Live LTP feed.
- `GET /api/strategy/open-inventory/:ticker`: Fetches ungrouped buy transactions.
- `POST /api/batches/create-selective`: Commits selected lots as a new Batch.

## 3. Frontend Component Hierarchy
- `App.tsx`: Router configuration using `BrowserRouter`.
- `MainLayout.tsx`: Master frame containing `Navbar` and `ZerodhaManager`.
- `LiveTrackerPage.tsx`: Real-time P&L monitoring.
- `InventoryPage.tsx`: Workbench for batch construction.
- `HistoryPage.tsx`: Archive of realized gains and historical trades.

---
*Last Updated: 2025-12-27*

## 4. Trading Strategy Logic (v3.0)
- **Unit Size:** Target cost basis per lot is ~₹5,000.
- **Sell Trigger:** A "Batch" (selection of lots) is eligible for exit only when the aggregate profit exceeds **3.0%**.
- **Visual Feedback:** - Individual P&L color-coded per lot.
  - Sidebar Summary background shifts to `bg-green-400` when the 3% threshold is crossed.

  ## 6. Infrastructure Notes
- **CORS Policy:** Strict origin validation is enforced in `index.js`. 
- **Allowed Origins:** `localhost:5173` and `*.vercel.app`.
- **Pre-flight:** OPTIONS requests must be handled to allow custom headers for portfolio data fetching.

## 2. API Endpoints Reference
...
### Transactions (CRUD)
- `GET /api/transactions`: Returns paginated transactions with optional ticker filter.
- `POST /api/transactions`: Adds a new buy/sell record.
- `PUT /api/transactions/:id`: Updates an existing record.
- `DELETE /api/transactions/:id`: Removes a record from the ledger.

## 3. Frontend Component Hierarchy
...
- `HistoryPage.tsx`: Admin view for data management. Includes pagination and filtering logic.
  - `TransactionModal.tsx`: Shared form for Add/Edit operations.

  ## 5. Implementation Details
- **Data Casting:** All numeric values from the API (quantity, price, total_cost) arrive as strings and must be wrapped in `parseFloat()` or `Number()` on the frontend.
- **Date Handling:** Dates are stored as ISO timestamps. Use `toLocaleDateString('en-IN')` for consistent UI presentation across Tracker and History pages.

## 4. Trading Strategy Logic
...
- **Transaction Management:** - New trades require a valid Ticker that exists in the `stocks` table.
  - Deleting a transaction is permanent and immediately affects the "Live Tracker" and "Inventory" views.
  - Dates must be stored in YYYY-MM-DD format for database compatibility.



  ### /src/pages/HistoryPage.tsx
- **State Management:** Uses `editingData` state to facilitate the "Edit" workflow, passing row-specific data down to the `TransactionModal`.
- **Date Transformation:** Handles conversion between ISO strings (DB) and YYYY-MM-DD strings (HTML5 Date Input).

### 5. Frontend Implementation
...
- **Transaction Entry:**
  - Type: Binary toggle (BUY/SELL).
  - Ticker: Strictly enforced through the `stocks` table configuration (display=TRUE).
  - Validation: Quantity and Price cast to Float64 before API submission.


  ## 4. Trading Strategy Logic (v4.0)
- **Pairing Architecture:** One-to-One mapping between BUY and SELL.
- **Batching Strategy:** Optional `batch_id` labels to group multiple pairings into a single cycle/batch.
- **UI Logic:** SELL entry is strictly disabled until exactly one BUY lot is selected.

## 3. Frontend Component Hierarchy
- `HistoryPage.tsx`: Primary data ledger. Filterable by Ticker and Date Range. No grouping logic.
- `BatchesPage.tsx`: Aggregated view of "Cycles". Groups 1:1 Buy/Sell pairs sharing a `batch_id`.
  - Displays Realized Gains and Cycle Duration.

  ## 4. Batch Management Workflow
- **HistoryPage:** Pure data entry (BUY/SELL). No strategy logic.
- **BatchesPage:** 1. Scan for closed pairings (SELL linked to BUY).
    2. Group selected pairings under a unique `batch_id`.
    3. Calculate aggregate realized gains for the batch.

    ### Page Responsibilities
- **InventoryPage:** Analysis & Simulation. Displays Unrealized P&L based on Live CMP. No data modification.
- **HistoryPage:** Record Keeping. Uses TransactionModal to log executed Zerodha trades (1:1 Matching).
- **BatchesPage:** Strategy Aggregation. Groups closed pairs into performance cycles.

### POST /api/transactions
- **Input:** `{ ticker, type, quantity, price, date, parent_buy_id? }`
- **Logic:** Server fetches `stock_id` from `stocks` table using `ticker`. 
- **Constraint:** `is_open` is automatically set to `TRUE` for BUY and `FALSE` for SELL.

## 1. Database Schema (Updated)
### Table: transactions
- `transaction_id`: UUID (PK)
- `parent_buy_id`: UUID (FK -> transactions.transaction_id) 
  *Used to link a SELL to its specific BUY lot.*
- `is_open`: BOOLEAN 
  *TRUE for active inventory, FALSE once a matching SELL is recorded.*
- `batch_id`: VARCHAR 
  *Optional grouping label applied via BatchesPage.*

  ### Primary Key Naming Convention
- All tables use `[table_name]_id` as the primary key.
- Foreign keys follow the same naming (e.g., `transactions.stock_id` references `stocks.stock_id`).

### POST /api/transactions/save
- **Function:** Handles both Create and Update.
- **Logic:** - If `transaction_id` is present: Performs `UPDATE`.
  - If `transaction_id` is null: Performs `INSERT`.
- **Integrity:** Automatically updates `parent_buy_id` linkage and `is_open` status based on `type`.

### Transaction Management
- `POST /api/transactions`: Creates a new record. Auto-closes linked buy lot if type=SELL.
- `PUT /api/transactions/:id`: Updates existing record. Handles parent lot cleanup (re-opening old links if changed).

### 5. HistoryPage Features
- **Pagination:** Server-side pagination supported. 
- **Controls:** Standard numeric page jump + Prev/Next buttons.
- **Visuals:** High-contrast brutalist design; active page highlighted in solid black.

### State Management
- **HistoryPage:** Must track `pagination` object: `{ currentPage, totalPages, totalRecords }`.
- **Loading States:** UI must display "Loading..." or skeletons until totalPages > 0 to prevent broken "Page of" text.

