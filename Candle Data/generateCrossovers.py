import json
import pandas as pd
import numpy as np
import os

def detect_val_crossover(current_val, prev_val, current_ref, prev_ref):
    """Detects Up/Down crossovers."""
    if pd.isna(current_val) or pd.isna(prev_val) or pd.isna(current_ref) or pd.isna(prev_ref):
        return None
    if current_val > current_ref and prev_val <= prev_ref:
        return 'Up'
    elif current_val < current_ref and prev_val >= prev_ref:
        return 'Down'
    return None

def clean_val(val):
    """Numpy to Python type conversion for JSON."""
    if pd.isna(val): return None
    if isinstance(val, (np.int64, np.int32)): return int(val)
    if isinstance(val, (np.float64, np.float32)): return float(val)
    return val

def process_crossover_chunk_filtered(input_json, output_json, start_row=0, chunk_size=1000, append=False):
    """
    Processes a chunk of candles and only saves those with at least one active crossover signal.
    """
    with open(input_json, 'r') as f:
        full_data = json.load(f)
    
    df = pd.DataFrame(full_data['data'])
    df_prev = df.shift(1)
    
    sma_periods = [5, 10, 20, 50, 100, 200, 500]
    sma_cols = [f'SMA_{p}' for p in sma_periods]
    
    process_start = max(0, start_row)
    process_end = min(len(df), start_row + chunk_size)
    
    chunk_results = []
    
    for i in range(process_start, process_end):
        signals = {}
        
        # 1. Price vs SMAs
        for col in sma_cols:
            signals[f"Price_vs_{col}"] = detect_val_crossover(df.at[i, 'Close'], df_prev.at[i, 'Close'], df.at[i, col], df_prev.at[i, col])
        
        # 2. SMA vs SMA
        for idx, p1 in enumerate(sma_periods):
            for p2 in sma_periods[idx+1:]:
                s_col, l_col = f'SMA_{p1}', f'SMA_{p2}'
                signals[f"{s_col}_vs_{l_col}"] = detect_val_crossover(df.at[i, s_col], df_prev.at[i, s_col], df.at[i, l_col], df_prev.at[i, l_col])
        
        # 3. Price vs VWAP & RSI Levels
        signals["Price_vs_VWAP"] = detect_val_crossover(df.at[i, 'Close'], df_prev.at[i, 'Close'], df.at[i, 'VWAP'], df_prev.at[i, 'VWAP'])
        signals["RSI_vs_30"] = detect_val_crossover(df.at[i, 'RSI_14'], df_prev.at[i, 'RSI_14'], 30, 30)
        signals["RSI_vs_70"] = detect_val_crossover(df.at[i, 'RSI_14'], df_prev.at[i, 'RSI_14'], 70, 70)
        
        # --- THE FILTER ---
        # Only proceed if at least one signal is 'Up' or 'Down'
        if any(v is not None for v in signals.values()):
            candle = {
                "Timestamp": df.at[i, "Timestamp"],
                "Close": clean_val(df.at[i, "Close"]),
                "Volume": clean_val(df.at[i, "Volume"]),
                "VWAP": clean_val(df.at[i, "VWAP"]),
                "RSI_14": clean_val(df.at[i, "RSI_14"]),
                "ATR_14": clean_val(df.at[i, "ATR_14"])
            }
            for col in sma_cols:
                candle[col] = clean_val(df.at[i, col])
            
            candle["crossovers"] = signals
            chunk_results.append(candle)

    # File Management
    final_list = []
    if append and os.path.exists(output_json):
        with open(output_json, 'r') as f:
            existing_data = json.load(f)
            final_list = existing_data.get('data', [])
            
    final_list.extend(chunk_results)
    
    output_obj = {
        "status": "success",
        "ticker": full_data.get('ticker', 'SILVERBEES'),
        "total_actionable_rows": len(final_list),
        "data": final_list
    }
    
    with open(output_json, 'w') as f:
        json.dump(output_obj, f, indent=4)
    
    print(f"Done! Found {len(chunk_results)} actionable candles in this chunk.")
    return process_end

# Usage:
next_idx = process_crossover_chunk_filtered('silver_full_indicators.json', 'silver_crossovers.json', start_row=30000, chunk_size=10000, append=True)
