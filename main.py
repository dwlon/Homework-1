import concurrent.futures
from io import StringIO
from bs4 import BeautifulSoup
import requests
from datetime import date, timedelta

from dateutil.relativedelta import relativedelta
from selenium import webdriver
from selenium.common import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time
import os

num_threads = int(os.cpu_count() / 2)
print("Number of browsers:", num_threads)

dates = {}
currentTime = date.today()

for i in range(0, 10):
    yearAgo = currentTime - relativedelta(years=1) + timedelta(days=1)
    if (currentTime - yearAgo).days <= 365:
        dates[currentTime] = yearAgo
    else:
        dates[currentTime] = yearAgo - timedelta(days=1)

    dates[currentTime] = yearAgo
    currentTime = currentTime - timedelta(days=365)

def scrape(url, driver):
    driver.get(url)

    for to_date, from_date in dates.items():
        toDate = WebDriverWait(driver, 1).until(EC.presence_of_element_located((By.ID, "ToDate")))
        fromDate = WebDriverWait(driver, 1).until(EC.presence_of_element_located((By.ID, "FromDate")))

        fromDate.clear()
        toDate.clear()
        fromDate.send_keys(from_date.strftime("%m/%d/%Y"))
        toDate.send_keys(to_date.strftime("%m/%d/%Y"))

        buttons = WebDriverWait(driver, 1).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "btn"))
        )
        buttons[1].click()

        try:
            WebDriverWait(driver, 1).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
        except TimeoutException:
            break

        table = pd.read_html(StringIO(driver.page_source))
        print("Data from: " + fromDate.get_attribute("value") + " - to: " + toDate.get_attribute("value"))
        print(table)

    return

def has_digits(string):
    return any(char.isdigit() for char in string)

st = time.time()

response = requests.get("https://www.mse.mk/en/stats/symbolhistory/ALK")
soup = BeautifulSoup(response.text, "html.parser")
codes = soup.select_one("#Code").select("option")

parsedCodes = [code.text for code in codes if not code.text.startswith("E") and not has_digits(code.text)]

chrome_options = Options()
# Uncomment these if you want chrome to operate in headless mode
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

drivers = [webdriver.Chrome(options=chrome_options) for _ in range(num_threads)]

def worker_task(code, driver):
    try:
        scrape(f"https://www.mse.mk/en/stats/symbolhistory/{code}", driver)
    except Exception as e:
        print(f"Error processing code {code}: {e}")

with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
    futures = []
    for i, code in enumerate(parsedCodes):
        driver = drivers[i % num_threads]
        futures.append(executor.submit(worker_task, code, driver))

    concurrent.futures.wait(futures)

for driver in drivers:
    driver.quit()

et = time.time()
total_time = et - st
print("Execution time: ", total_time, "seconds")
