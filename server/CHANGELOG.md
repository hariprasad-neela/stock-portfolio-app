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

To freeze your progress correctly, you should place this content into a `CHANGELOG.md` file in your project's root directory. This acts as the "source of truth" for what was achieved during this stability sprint.

# Changelog: Stock Portfolio Application


## [2.0.0] - 2025-12-24

### "Soundness & Stability" Freeze

### 🏗️ Backend & Database Integrity

* **UUID & Type Safety**: Corrected SQL parameter mapping in `addTransaction` and `updateTransaction` to properly handle `profile_id` (UUID) and `type` (Enum), resolving "invalid input syntax" and "check constraint" errors.
* **Data Aggregation**: Refactored the Portfolio SQL query to use `SUM()` and `GROUP BY` logic, collapsing individual buy lots into single, ticker-based summary cards.
* **Specific Identification (Sell Lot)**: Implemented backend support for closing specific transaction IDs to support precise capital gains tracking.
* **Numeric Precision**: Standardized `NUMERIC(15,2)` types for `price` and `quantity` to prevent rounding errors during calculations.

### 🖥️ Frontend & State Management

* **Price Population Fix**: Resolved a critical bug where the Price field remained blank during edits by implementing `parseFloat()` casting within the `TransactionForm` `useEffect` hook.
* **State-Based Navigation**: Migrated the Dashboard from URL-based routing to a React state-based dropdown system, eliminating unnecessary page reloads and "Error 31" crashes.
* **Router Context**: Fixed the "Basename Null" crash by properly wrapping the application in `BrowserRouter`.
* **Thunk Resilience**: Standardized Redux `createAsyncThunk` exports and implemented `extraReducers` for optimistic UI updates.

### 🎨 UI/UX Improvements

* **Neobrutalist Design**: Restored high-contrast borders and "hard shadows" across the card and modal components.
* **Responsive Grid**: Fixed the Portfolio Overview layout using Tailwind CSS Grid to ensure cards are uniform and responsive.
* **Data Guarding**: Added loading and empty-state checks to the Overview page to prevent blank screen crashes when data is unavailable.

---

## [2.0.0] - 2025-12-24

### "Soundness & Stability" Phase

### 🏗️ Backend & Database Integrity

* **UUID Mapping Correction**: Fixed parameter mismatch in `addTransaction` and `updateTransaction` to properly cast `profile_id` as UUID, resolving "invalid input syntax" database crashes.
* **Portfolio Aggregation Logic**: Refactored SQL queries to use `SUM()` and `GROUP BY`, consolidating individual buy lots into single summary cards per ticker.
* **Specific Identification Prep**: Implemented support for individual transaction targeting to facilitate future "Selective Batching" strategy.
* **Data Consistency**: Standardized numeric types for `price` and `quantity` to prevent floating-point rounding errors during profit calculations.

### 🖥️ Frontend & State Management

* **Edit Modal Price Fix**: Resolved the "Blank Price" bug in the `TransactionForm` by implementing `parseFloat` casting within the `useEffect` hook to ensure numeric strings populate correctly.
* **Router Context Resolution**: Wrapped the application root in `BrowserRouter` to fix `basename` null errors and enable dynamic routing.
* **State-Driven Dashboard**: Migrated ticker selection from URL params to local React state, improving navigation speed and resolving "Error 31" crashes.
* **Redux Thunk Hardening**: Standardized API response handling in Redux slices to manage loading and error states gracefully.

### 🎨 UI & Design Recovery

* **Neobrutalist Design Restoration**: Re-applied high-contrast borders (`border-3`), thick shadows, and the primary color palette across all card and modal components.
* **Layout Stability**: Fixed the CSS Grid for the Portfolio Overview to ensure card uniformity across various screen sizes.
* **Empty State Handling**: Added "Data Guards" to prevent application crashes when the database returns an empty transaction history.

---

## [1.0.0] - Initial Prototype

* Initial project setup with React and Node.js.

* Basic CRUD operations for stock transactions.
* PostgreSQL schema initialization for stocks and transactions.

---

### 💾 Next Steps to "Freeze"

To ensure this is properly archived before moving to Version 3, follow these terminal commands:

1. **Save the file**: Create/Update `CHANGELOG.md` with the content above.
2. **Commit the logs**:
```bash
git add CHANGELOG.md
git commit -m "docs: finalize v2.0.0 changelog"

```


3. **Branch for Version 3**:
```bash
git checkout -b v3-development

```