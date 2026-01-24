import json
import pandas as pd
import numpy as np

def calculate_rsi(series, period=14):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculate_vwap(df):
    """
    Calculates Volume Weighted Average Price (VWAP).
    Resets at the start of each trading day.
    """
    # Create a temporary date key for grouping
    df['Date_Key'] = df['Timestamp'].dt.date
    # TPV = (High + Low + Close) / 3 * Volume
    df['TPV'] = ((df['High'] + df['Low'] + df['Close']) / 3) * df['Volume']
    
    # Cumulative TPV and Volume per day
    df['Cum_TPV'] = df.groupby('Date_Key')['TPV'].cumsum()
    df['Cum_Vol'] = df.groupby('Date_Key')['Volume'].cumsum()
    
    vwap = df['Cum_TPV'] / df['Cum_Vol']
    
    # Clean up temporary columns
    df.drop(['Date_Key', 'TPV', 'Cum_TPV', 'Cum_Vol'], axis=1, inplace=True)
    return vwap

def calculate_atr(df, period=14):
    """Calculates Average True Range (ATR)."""
    high_low = df['High'] - df['Low']
    high_close = np.abs(df['High'] - df['Close'].shift())
    low_close = np.abs(df['Low'] - df['Close'].shift())
    
    true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    return true_range.rolling(window=period).mean()

def generate_full_json(file_array, output_filename):
    """
    Main function to read ordered files, merge them, 
    and calculate all requested indicators.
    """
    all_candles = []
    
    # 1. Read files in strict array order
    for file_path in file_array:
        try:
            with open(file_path, 'r') as f:
                raw_data = json.load(f)
                if 'data' in raw_data and 'candles' in raw_data['data']:
                    all_candles.extend(raw_data['data']['candles'])
        except Exception as e:
            print(f"Error loading {file_path}: {e}")

    # 2. Convert to DataFrame
    df = pd.DataFrame(all_candles, columns=['Timestamp', 'Open', 'High', 'Low', 'Close', 'Volume'])
    df['Timestamp'] = pd.to_datetime(df['Timestamp'])
    df = df.drop_duplicates(subset=['Timestamp']).reset_index(drop=True)
    
    # Ensure numeric types
    cols = ['Open', 'High', 'Low', 'Close', 'Volume']
    df[cols] = df[cols].apply(pd.to_numeric)

    # 3. Calculate SMAs (Round to 2)
    periods = [5, 10, 20, 50, 100, 200, 500]
    for p in periods:
        df[f'SMA_{p}'] = df['Close'].rolling(window=p).mean().round(2)

    # 4. Calculate RSI (14) (Round to 2)
    df['RSI_14'] = calculate_rsi(df['Close'], 14).round(2)

    # 5. Calculate VWAP (Intraday reset) (Round to 2)
    df['VWAP'] = calculate_vwap(df).round(2)

    # 6. Calculate ATR (14) (Round to 2)
    df['ATR_14'] = calculate_atr(df, 14).round(2)

    # 7. Export to JSON
    df_json = df.where(pd.notnull(df), None)
    df_json['Timestamp'] = df_json['Timestamp'].dt.strftime('%Y-%m-%dT%H:%M:%S%z')
    
    final_output = {
        "status": "success",
        "ticker": "SILVERBEES",
        "data": df_json.to_dict(orient='records')
    }

    with open(output_filename, 'w') as f:
        json.dump(final_output, f, indent=4)
    
    print(f"File created: {output_filename}")

# Usage
my_files = [
     "silver_15min_2022_Feb-Jun.json",
     "silver_15min_2022_July-Dec.json", 
     "silver_15min_2023_Jan-Jun.json",
     "silver_15min_2023_July-Dec.json",
     "silver_15min_2024_Jan-Jun.json",
     "silver_15min_2024_July-Dec.json",
     "silver_15min_2025_Jan-Jun.json",
     "silver_15min_2025_July-Dec.json",
     "silver_15min_2026_Jan-Jun.json"
]
generate_full_json(my_files, "silver_full_indicators.json")