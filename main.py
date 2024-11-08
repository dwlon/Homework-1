import pandas as pd
import requests
import sqlite3
import datetime
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import StringIO
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Define the base URL
BASE_URL = "https://www.mse.mk/en/stats/symbolhistory"

# Initialize fake user agent
ua = UserAgent()
HEADERS = {'User-Agent': ua.random}

def initialize_database():
    conn = sqlite3.connect("stock_data.db")
    conn.execute('''
        CREATE TABLE IF NOT EXISTS stock_data (
            issuer TEXT,
            date TEXT,
            last_trade_price REAL,
            max REAL,
            min REAL,
            avg_price REAL,
            percent_change REAL,
            volume REAL,
            turnover_best REAL,
            total_turnover REAL,
            PRIMARY KEY (issuer, date)
        )
    ''')
    conn.commit()
    conn.close()

def create_session():
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=0.5, status_forcelist=[429, 500, 502, 503, 504])
    session.mount('https://', HTTPAdapter(max_retries=retries))
    return session

#Filter 1
def get_issuer_codes():
    session = create_session()
    response = session.get(f"{BASE_URL}/ADIN", headers=HEADERS)
    soup = BeautifulSoup(response.text, "html.parser")
    codes = soup.select_one("#Code").select("option")
    return [code.text for code in codes if code.text and code.text.isalpha() and not (code.text.startswith("EU") or code.text.startswith("EV"))]


#Filter 2
def get_last_available_date(conn, issuer):
    cur = conn.cursor()
    cur.execute("SELECT MAX(date) FROM stock_data WHERE issuer = ?", (issuer,))
    result = cur.fetchone()[0]
    if result:
        return (datetime.datetime.strptime(result, "%Y-%m-%d") + datetime.timedelta(days=1)).strftime("%m/%d/%Y")
    else:
        return (datetime.datetime.now() - datetime.timedelta(days=3650)).strftime("%m/%d/%Y")

def format_date(date):
    return date.strftime("%m/%d/%Y")

def switch_delimiters(value):
    value = str(value)
    value = value.replace(',','_')
    value = value.replace('.',',')
    value = value.replace('_','.')
    return value

#Filter 3
def fetch_issuer_data(issuer, start_date):
    session = create_session()
    current_date = datetime.datetime.strptime(start_date, "%m/%d/%Y")
    end_date = datetime.datetime.now()
    data_frames = []

    while current_date <= end_date:
        next_date = min(current_date + datetime.timedelta(days=365), end_date)
        url = f"{BASE_URL}/{issuer}?FromDate={format_date(current_date)}&ToDate={format_date(next_date)}"
        response = session.get(url, headers=HEADERS)

        try:
            tables = pd.read_html(StringIO(response.text))
            df = tables[0]
            df['issuer'] = issuer
            df.columns = [
                'date', 'last_trade_price', 'max', 'min', 'avg_price',
                'percent_change', 'volume', 'turnover_best', 'total_turnover', 'issuer'
            ]

            df['date'] = pd.to_datetime(df['date'], format='%m/%d/%Y').dt.strftime('%Y-%m-%d')

            columns_to_edit = ['last_trade_price', 'max', 'min', 'avg_price', 'volume', 'turnover_best', 'total_turnover']

            for column in columns_to_edit:
                df[column] = df[column].apply(lambda x: "{:,.2f}".format(float(x)))
                df[column] = df[column].apply(switch_delimiters)

            data_frames.append(df)
        except ValueError:
            pass

        current_date = next_date + datetime.timedelta(days=1)

    return pd.concat(data_frames, ignore_index=True) if data_frames else pd.DataFrame()

def process_issuer(issuer):
    conn = sqlite3.connect("stock_data.db")
    try:
        last_date = get_last_available_date(conn, issuer)
        new_data = fetch_issuer_data(issuer, last_date)
        if not new_data.empty:
            new_data.to_sql("stock_data", conn, if_exists="append", index=False)
        return f"Processed {issuer}: {len(new_data)} records fetched"
    finally:
        conn.close()

def main():
    start_time = time.time()
    initialize_database()
    issuer_codes = get_issuer_codes()
    print(f"Retrieved issuer codes: {issuer_codes}")

    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(process_issuer, issuer) for issuer in issuer_codes]
        for future in as_completed(futures):
            print(future.result())

    end_time = time.time()
    print(f"Data population completed in {end_time - start_time:.2f} seconds.")

if __name__ == "__main__":
    main()
