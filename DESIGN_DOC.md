# Design Document: Stock Portfolio Tracker (v5.0)

## 1. Overview

A specialized portfolio tracking web application designed for active traders who manage stocks in distinct "lots" or "cycles." The application focuses on data integrity, strict 1:1 matching between BUY and SELL transactions, and performance analysis through batch grouping.

## 2. Technical Stack

* **Frontend:** React (TypeScript) with Vite
* **Backend:** Node.js / Express
* **Database:** PostgreSQL (Hosted on Render)
* **Styling:** Tailwind CSS with a centralized Brutalist theme (`uiTheme.ts`)

---

## 3. Data Model (Schema)

### 3.1 Transactions Table

Primary ledger for all movements.
| Column | Type | Description |
| :--- | :--- | :--- |
| `transaction_id` | UUID (PK) | Unique identifier. |
| `portfolio_id` | UUID (FK) | Links to the user's portfolio. |
| `stock_id` | UUID (FK) | Resolved server-side from Ticker name. |
| `type` | VARCHAR | "BUY" or "SELL". |
| `date` | DATE | Execution date (DD/MM/YYYY). |
| `quantity` | NUMERIC | Number of units traded. |
| `price` | NUMERIC | Price per unit. |
| `parent_buy_id` | UUID (FK) | (Self-Ref) Links a SELL to a specific BUY lot (1:1). |
| `is_open` | BOOLEAN | TRUE for active inventory; FALSE for closed lots. |
| `batch_id` | VARCHAR | Optional grouping label for performance cycles. |

### 3.2 Primary Key Naming Convention

* All tables use `[table_name]_id` as the primary key.
* Foreign keys follow the same naming (e.g., `transactions.stock_id` references `stocks.stock_id`).

---

## 4. Page Specifications

### 4.1 HistoryPage

A clean, high-speed ledger for raw data management.

* **Features:** - Server-side pagination (10 records per page).
* Filters: Ticker (Active stocks dropdown), From Date, and To Date.
* Flat table view (Date, Ticker, Type, Qty, Price, Batch ID).


* **Navigation:** Standard numeric page jump + Prev/Next buttons.

### 4.2 InventoryPage

The analysis and simulation layer.

* **Features:** - Displays only `is_open = TRUE` transactions.
* Calculates Unrealized P&L based on Live CMP (Current Market Price).
* Lot-based cards showing acquisition date, cost, and percentage gain.



### 4.3 BatchesPage

The strategy aggregation layer for performance tracking.

* **Features:** - **Unbatched View:** Scans for closed 1:1 pairs (SELL linked to BUY) that lack a `batch_id`.
* **Creation:** Allows users to select multiple pairs and assign them a unique `batch_name`.
* **Batch Summary:** Displays realized profit, total trade count, and duration for each batch.



---

## 5. UI & Component Standards

### 5.1 Centralized Theme (`uiTheme.ts`)

All components must consume `uiTheme.ts`. Direct Tailwind utility usage in components is discouraged for structural elements.

* **Brutalist Style:** Thick black borders (`border-4`), heavy shadows, and high-contrast colors (Black, White, Yellow, Green).

> **Responsive Data Display:**
> * **Data Grids:** All tables must be wrapped in an `overflow-x-auto` container to support mobile swiping.
> * **Action Headers:** Primary action buttons (Add/Confirm) must transition to `width: 100%` on screens smaller than 768px to ensure accessibility.


### 5.2 TransactionModal

* **Responsive Layout:** Uses `max-h-[95vh]` with internal scrolling and sticky headers/footers to support mobile viewports.
* **Data Entry Logic:**
* **Mode BUY:** Quantity is an editable field.
* **Mode SELL:** Quantity field is read-only and auto-fills upon selecting a "Parent Buy Lot."


* **Date Input:** Native date picker integrated with standard theme styles.

> **Styling Governance:**
> * **Zero-Utility Policy:** Components must not contain raw Tailwind strings for structural styling.
> * **Theme Injection:** All styling must be consumed from `uiTheme.ts`.
> * **Consistency:** Any visual update (e.g., changing shadow depth) must be performed in `uiTheme.ts` to ensure application-wide synchronization.


---

## 6. Business Logic & Constraints

### 6.1 The 1:1 Matching Rule

* Every SELL transaction must be linked to exactly one BUY transaction via `parent_buy_id`.
* **No Partial Selling:** A BUY lot is treated as a single unit. To sell a partial amount, the user must have entered the BUY as separate transactions initially.
* **Auto-Sync:** Saving a SELL transaction automatically updates the `parent_buy_id` record's `is_open` status to `FALSE`.

### 6.2 Batch Integrity

* Batch management (creation and grouping) is handled exclusively on the **BatchesPage**.
* Editing a transaction's `parent_buy_id` triggers a cleanup logic on the backend to reopen the old parent lot and close the new one.

---

## 7. API Contract

| Endpoint | Method | Payload / Result | Description |
| --- | --- | --- | --- |
| `/api/transactions` | GET | `{ records, totalPages, ... }` | Paginated and filtered ledger. |
| `/api/transactions` | POST | `{ ticker, qty, price, date, type, parent_buy_id? }` | Resolves `stock_id` and creates record. |
| `/api/transactions/:id` | PUT | Same as POST | Updates record and handles lot cleanup. |
| `/api/market/active-tickers` | GET | `["TICKER1", "TICKER2"]` | Returns stocks where `display = TRUE`. |
| `/api/batches/unbatched` | GET | `[{ pair_id, profit, ... }]` | Returns pairs ready for grouping. |
