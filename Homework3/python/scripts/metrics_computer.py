import sqlite3
import pandas as pd
import numpy as np
from ta import momentum, trend

DB_PATH = "../../database/stock_data.db"

def initialize_table():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS precomputed_metrics (
            issuer TEXT,
            period TEXT,
            start_date TEXT,
            end_date TEXT,
            rsi REAL,
            macd REAL,
            stoch REAL,
            ao REAL,
            williams REAL,
            cci REAL,
            sma REAL,
            ema REAL,
            wma REAL,
            hma REAL,
            ibl REAL,
            PRIMARY KEY (issuer, period, start_date, end_date)
        )
    ''')
    conn.commit()
    conn.close()

def calculate_indicators(df, period):
    indicators = {}

    if period == '1d':
        window = 14
    elif period == '1w':
        window = 14 * 5
    elif period == '1m':
        window = 14 * 21

    rsi = momentum.RSIIndicator(close=df['last_trade_price'], window=window)
    indicators['rsi'] = rsi.rsi().iloc[-1]

    macd = trend.MACD(close=df['last_trade_price'], window_slow=12, window_fast=26)
    indicators['macd'] = macd.macd().iloc[-1]

    stoch = momentum.StochasticOscillator(
        high=df['max'],
        low=df['min'],
        close=df['last_trade_price'],
        window=window,
        smooth_window=3
    )
    indicators['stoch'] = stoch.stoch().iloc[-1]

    df['midpoint'] = (df['max'] + df['min']) / 2
    short_sma = df['midpoint'].rolling(window=5).mean()
    long_sma = df['midpoint'].rolling(window=window).mean()
    indicators['ao'] = (short_sma - long_sma).iloc[-1]

    williams = momentum.WilliamsRIndicator(high=df['max'], low=df['min'], close=df['last_trade_price'])
    indicators['williams'] = williams.williams_r().iloc[-1]

    cci = trend.CCIIndicator(high=df['max'], low=df['min'], close=df['last_trade_price'], window=window)
    indicators['cci'] = cci.cci().iloc[-1]

    indicators['sma'] = df['last_trade_price'].rolling(window=window).mean().iloc[-1]
    indicators['ema'] = df['last_trade_price'].ewm(span=window, adjust=False).mean().iloc[-1]
    indicators['wma'] = df['last_trade_price'].rolling(window=window).apply(lambda x: np.average(x, weights=np.arange(1, window + 1))).iloc[-1]
    indicators['hma'] = df['last_trade_price'].rolling(window=window).apply(lambda x: np.sqrt(np.average(x ** 2))).iloc[-1]

    high = df['max'].rolling(window=window).max()
    low = df['min'].rolling(window=window).min()
    ibl = (high + low) / 2
    indicators['ibl'] = ibl.iloc[-1]

    return indicators

def precompute_metrics(conn, issuer, period):
    query = f"SELECT * FROM stock_data WHERE issuer = '{issuer}' ORDER BY date"
    df = pd.read_sql_query(query, conn)
    df['date'] = pd.to_datetime(df['date'])

    if df.empty:
        return
    if period == '1d':
        data = df.tail(14).copy()
    elif period == '1w':
        data = df.tail(14 * 5).copy()
    elif period == '1m':
        data = df.tail(14 * 21).copy()
    else:
        return

    metrics = calculate_indicators(data, period)
    start_date = data['date'].min().strftime('%Y-%m-%d')
    end_date = data['date'].max().strftime('%Y-%m-%d')

    conn.execute('''  
        INSERT OR REPLACE INTO precomputed_metrics (
            issuer, period, start_date, end_date,
            rsi, macd, stoch, ao, williams, cci,
            sma, ema, wma, hma, ibl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        issuer, period, start_date, end_date,
        metrics['rsi'], metrics['macd'], metrics['stoch'], metrics['ao'], metrics['williams'], metrics['cci'],
        metrics['sma'], metrics['ema'], metrics['wma'], metrics['hma'], metrics['ibl']
    ))
    conn.commit()

def main():
    initialize_table()

    conn = sqlite3.connect(DB_PATH)

    issuers = pd.read_sql_query("SELECT DISTINCT issuer FROM stock_data", conn)['issuer'].tolist()

    periods = ['1d', '1w', '1m']

    for issuer in issuers:
        for period in periods:
            precompute_metrics(conn, issuer, period)

    conn.close()

if __name__ == "__main__":
    main()
