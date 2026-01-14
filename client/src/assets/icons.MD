Category            Icon    Color Code      Purpose
Target Reached      🚀      bg-green-400    Profit $\ge$ 3.0%. Ready for "Execute Sell".
Near Target         🎯      bg-yellow-400   Profit 2.0% - 2.99%. High priority monitoring.
Holding             🧊      bg-blue-400     Profit 0% - 1.99%. Stable/Cooling phase.
Under Water         ⚓      bg-red-400      Negative P&L. Lot is "anchored" in inventory.
Atomic Order        ⚛️      bg-purple-400   Represents the ₹5000 base lot unit.
Live Price          ⚡      bg-orange-400   Real-time Kite/Zerodha price updates.


Logic Type          Icon    UI Color        Requirement         
Standard Sell       🚀     bg-green-400    Individual Lot $\ge 3\%$
Inventory Clear     🧹     bg-cyan-400     Net Batch Profit $\ge ₹150$
Stale Lot           ⏳     Border-dashed   Held > X Days


Status              Icon    Color (Neo-Pop) UI Usage
Success             🚀      bg-green-400    Target hit, safe to sell.
Warning             ⏳      bg-yellow-400   Stale lot, needs clearing.
Danger              ⚓      bg-red-400      Under water (loss). 
Neutral             🧊      bg-blue-400     Holding/Stable.
System              ⚛️      bg-purple-400   Atomic units / Redux status.