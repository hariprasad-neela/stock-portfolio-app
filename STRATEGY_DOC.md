# Strategy Document: Lot-Based Cycle Trading (STRATEGY_DOC.md)

## 1. Summary

This strategy treats equity trading as a series of independent, traceable **Trading Cycles** rather than a single "average cost" position. Every market entry is recorded as a discrete **Trading Lot** with a fixed capital allocation. By enforcing a strict 1:1 matching rule between BUY and SELL transactions, the strategy ensures absolute transparency in performance attribution and capital rotation.

## 2. Goal & Purpose

* **Precise Profit Attribution:** To isolate the exact P&L of every entry and exit point.
* **Capital Velocity:** To maintain high money rotation by exiting lots as soon as targets are met, regardless of the overall position size.
* **Strategic Discipline:** To eliminate "holding and hoping" by requiring every lot to have a predefined exit logic (Target-based or Time-based).
* **Risk-Managed Averaging:** To use grouping (batching) to resolve stale or underwater lots through aggregate liquidation at a net profit.

## 3. Trading Strategy

### 3.1 Entry Logic (The BUY Phase)

* **Fixed Unit Sizing:** Every lot is allocated approximately **₹5,000**. The number of shares is determined by the Current Market Price (CMP) at the time of execution.
* **Initial Entry:** A new lot is opened for a ticker if zero lots currently exist, or if the daily price action is negative.
* **Step-Down Entry:** Additional lots are purchased if the CMP is lower than the price of the **last** purchased lot.
* **Averaging Entry:** A lot is purchased if the CMP falls below the **weighted average buy price** of all currently open lots for that ticker.

### 3.2 Exit Logic (The SELL Phase)

* **1:1 Matching:** Every SELL order must pair with and completely close exactly one specific BUY lot.
* **Target-Based Exit:** A lot is sold once the CMP reaches **+3%** of its specific buy price.
* **Aggregate Exit:** If multiple lots exist, they may be sold together if the latest lots hit the 3% target individually, or if the entire group reaches an **overall 3% profit**.
* **Time-Decay (Stale Lot) Rule:** If a lot remains open for **20 days or more**, it becomes a "Stale Lot." It will be sold alongside newer profitable lots to ensure the total transaction results in a **Net Profit**, even if the stale lot itself is sold at a break-even or minor loss.

### 3.3 Market-Adaptive Overlay

The strategy adjusts based on overall market sentiment and capital availability:

* **Bull Market Bias:** In bullish conditions, entries may be triggered on minor price dips, and targets are strictly held.
* **Bear Market Bias:** In bearish conditions, exit targets may be lowered to prioritize capital preservation and liquidity.
* **Daily Caps:** At least 1 and at most 5 lots are traded per day across all tickers to manage exposure.
* **Concentration Limit:** No more than 5 different tickers are exited on a single day to prevent over-diversification of realized gains.
* **Capital Constraint:** All buy/sell decisions are subject to the available margin/funds in the brokerage account.

## 4. Batching for Averaging & Profit Tracking

### 4.1 Synthetic Averaging & Liquidation

* **The Batch Concept:** Individual lots maintain distinct cost bases but are grouped into a **Batch** to visualize aggregate performance.
* **Net-Positive Goal:** The ultimate objective of a batch is a **Net Profit** at the aggregate level. This allows the strategy to "clear" underwater lots by offsetting them with high-performing lots within the same batch.

### 4.2 Performance Analysis

* **Batch-Level P&L:** Realized profit is calculated by summing the gains of all 1:1 pairs within a completed batch.
* **Money Rotation:** Batching is used to evaluate how quickly capital is cycled out of a specific ticker and back into the available margin for new trades.
* **Strategy Refinement:** By analyzing batch duration, the strategy identifies which tickers or market conditions lead to the most efficient 1:1 cycle closures.
