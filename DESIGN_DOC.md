# DESIGN_DOC.md: Stock Portfolio & Strategy Tracker (v3)

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

## 4. Trading Strategy Logic

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


## 4. Data Persistence (PostgreSQL)
- `app_config`: Key-value store for persisting `zerodha_access_token` to survive server restarts.
- `transactions`: Historical buy/sell data imported from brokers.
- `batches`: User-defined groups of transactions forming the "Selective Units."

---
*Last Updated: 2025-12-27*
