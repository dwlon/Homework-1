# Macedonian Stock Exchange Data and Analysis App
## The project is deployed on Azure. Access it live here:  
[StockPulsar Live Deployment](https://stockpulsar-deploy-finki-feg8a7c8aaf2h6ef.westeurope-01.azurewebsites.net/)
---
This project provides a comprehensive stock data analysis platform that retrieves data from the Macedonian Stock Exchange (MSE) and performs various analyses. It features:


- **Technical Analysis**
- **Fundamental Analysis**
- **LSTM Stock Price Prediction**

The project is built with:
- **Python** for data scraping, analysis, and machine learning.
- **Java Spring Boot** for backend API development.
- **React** for the frontend user interface.

# Features

1. **Daily Stock Data Update**
    - Python script scrapes stock data from MSE daily and saves it to an SQLite database.
    - Data includes real-time market prices and other relevant metrics.

2. **Analysis Types**
    - **Technical Analysis**: Identify trends and indicators.
    - **Fundamental Analysis**: Evaluate stock value based on news sentiment analysis, financial statements and ratios.
    - **LSTM Stock Price Prediction**: Predict future stock prices using machine learning.

3. **SQLite Database**
    - Shared database for Python and Java to store stock data and analysis results.

4. **Backend (Java Spring Boot)**
    - RESTful APIs for retrieving stock data and analysis results.
    - Serves as a bridge between the database and the frontend.

5. **Frontend (React)**
    - User-friendly interface for visualizing stock data and analyses.
    - Makes API requests to the Java backend.

# Design Patterns

## Microservices
- 4 different api's for specific independant data.
## Model View Controller
- The Spring-Boot applications are built with the MVC Pattern. 
## Pipe and Filter
- Is used in multiple python scripts. One example is:
    ```python
    #Filter1
    async def get_issuer_codes(conn):
    cursor = conn.cursor()

    cursor.execute("SELECT issuer FROM issuer_links")
    issuer_codes = [row[0] for row in cursor.fetchall()]

    return issuer_codes

    #Filter2
    def get_last_available_date(conn, issuer):
    cur = conn.cursor()
    cur.execute("SELECT MAX(date) FROM stock_data WHERE issuer = ?", (issuer,))
    result = cur.fetchone()[0]
    if result:
        return (datetime.datetime.strptime(result, "%Y-%m-%d") + datetime.timedelta(days=1)).strftime("%m/%d/%Y")
    else:
        return (datetime.datetime.now() - datetime.timedelta(days=3650)).strftime("%m/%d/%Y")

    #Filter3
    async def fetch_issuer_data(session, issuer, start_date, end_date):
    async with semaphore2:
        url = f"{BASE_URL_DATA}/{issuer}?FromDate={format_date_MSE(start_date)}&ToDate={format_date_MSE(end_date)}"

        response_text = await fetch(session, url)
        try:
            tables = pd.read_html(StringIO(response_text), flavor="lxml")
            df = tables[0]
            df['issuer'] = issuer
            df.columns = [
                'date', 'last_trade_price', 'max', 'min', 'avg_price',
                'percent_change', 'volume', 'turnover_best', 'total_turnover', 'issuer'
            ]

            df = df.dropna(subset=['max', 'min'])

            if not df.empty:
                df.loc[:, 'date'] = pd.to_datetime(df['date'], format='%m/%d/%Y').dt.strftime('%Y-%m-%d')

            return df
        except ValueError:
            return pd.DataFrame()
## Singleton
```python
    def initialize_database():
    db_folder = os.path.join(os.path.dirname(__file__), "..", "..", "database")
    os.makedirs(db_folder, exist_ok=True)
    db_path = os.path.join(db_folder, "stock_data.db")

    conn = sqlite3.connect(db_path)
    conn.execute('''CREATE TABLE IF NOT EXISTS stock_data (...)''')
    conn.commit()
    conn.close()
```
## Decorator
```python
    def switch_delimiters(value):
    if pd.isna(value):
        return value
    value = str(value).replace(',', '_').replace('.', ',').replace('_', '.')
    return value
```
## Template Pattern
```python
    def extract_news(article_links, dates, issuer, conn):
    for link, date in zip(article_links, dates):
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM news_sentiments WHERE link = ?", (link,))
        if cursor.fetchone():
            print(f"Link already processed. Skipping...")
            continue

        driver.get(link)
        try:
        except Exception as e:
            print(f"Error: {e}")
        finally:
            continue
```
## Command Pattern
```python
    download_buttons = driver.find_elements(By.XPATH, "//div[contains(@title, '.pdf')]")
if download_buttons:
    for button in download_buttons:
        button.click()
```
