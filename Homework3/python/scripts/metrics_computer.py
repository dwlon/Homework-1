import sqlite3
import pandas as pd
import numpy as np
import datetime
from ta import momentum, trend, volatility

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
            roc REAL, 
            williams REAL,
            cci REAL,
            sma REAL,
            ema REAL,
            wma REAL,
            hma REAL,
            tma REAL,
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

    macd = trend.MACD(close=df['last_trade_price'])
    indicators['macd'] = macd.macd().iloc[-1]

    stoch = momentum.StochasticOscillator(
        high=df['max'],
        low=df['min'],
        close=df['last_trade_price']
    )
    indicators['stoch'] = stoch.stoch().iloc[-1]

    roc = momentum.ROCIndicator(close=df['last_trade_price'], window=window)
    indicators['roc'] = roc.roc().iloc[-1]

    williams = momentum.WilliamsRIndicator(high=df['max'], low=df['min'], close=df['last_trade_price'])
    indicators['williams'] = williams.williams_r().iloc[-1]

    cci = trend.CCIIndicator(high=df['max'], low=df['min'], close=df['last_trade_price'], window=window)
    indicators['cci'] = cci.cci().iloc[-1]

    indicators['sma'] = df['last_trade_price'].rolling(window=9).mean().iloc[-1] if len(df) >= 9 else np.nan
    indicators['ema'] = df['last_trade_price'].ewm(span=9, adjust=False).mean().iloc[-1] if len(df) >= 9 else np.nan
    indicators['wma'] = \
    df['last_trade_price'].rolling(window=20).apply(lambda x: np.average(x, weights=np.arange(1, 21))).iloc[-1] if len(
        df) >= 20 else np.nan
    indicators['hma'] = df['last_trade_price'].rolling(window=14).apply(lambda x: np.sqrt(np.average(x ** 2))).iloc[
        -1] if len(df) >= 14 else np.nan


    if period == '1d':
        indicators['tma'] = np.nan
    else:
        tma_1 = df['last_trade_price'].rolling(window=30).mean()
        indicators['tma'] = tma_1.rolling(window=30).mean().iloc[-1] if len(df) >= 30 else np.nan

    return indicators


def precompute_metrics(conn, issuer, period):
    query = f"SELECT * FROM stock_data WHERE issuer = '{issuer}' ORDER BY date"
    df = pd.read_sql_query(query, conn)
    df['date'] = pd.to_datetime(df['date'])

    if df.empty:
        return
    if period == '1d':
        data = df.tail(14)
    elif period == '1w':
        data = df.tail(14 * 5)
    elif period == '1m':
        data = df.tail(14 * 21)
    else:
        return

    metrics = calculate_indicators(data, period)
    start_date = data['date'].min().strftime('%Y-%m-%d')
    end_date = data['date'].max().strftime('%Y-%m-%d')

    conn.execute('''  
        INSERT OR REPLACE INTO precomputed_metrics (
            issuer, period, start_date, end_date,
            rsi, macd, stoch, roc, williams, cci,
            sma, ema, wma, hma, tma
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        issuer, period, start_date, end_date,
        metrics['rsi'], metrics['macd'], metrics['stoch'], metrics['roc'], metrics['williams'], metrics['cci'],
        metrics['sma'], metrics['ema'], metrics['wma'], metrics['hma'], metrics['tma']
    ))
    conn.commit()


def main():
    initialize_table()

    conn = sqlite3.connect(DB_PATH)

    issuers = pd.read_sql_query("SELECT DISTINCT issuer FROM stock_data", conn)['issuer'].tolist()

    periods = ['1d', '1w', '1m']

    for issuer in issuers:
        for period in periods:
            print(f"Processing {issuer} for period {period}...")
            precompute_metrics(conn, issuer, period)

    conn.close()
    print("Precomputation completed.")


if __name__ == "__main__":
    main()
