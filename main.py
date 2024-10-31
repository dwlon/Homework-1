import concurrent.futures
from bs4 import BeautifulSoup
import requests
from datetime import date, timedelta
from selenium import webdriver
from selenium.common import TimeoutException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time
import os

num_threads = os.cpu_count() / 2
print(num_threads)

def scrape(url):
    chrome_options = Options()

    # Comment these if you want chrome to pop-up
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=chrome_options)

    driver.get(url)

    current = date.today()

    for i in range(0, 10):
        year_ago = current - timedelta(days=365)

        toDate = driver.find_element(By.ID, "ToDate")
        fromDate = driver.find_element(By.ID, "FromDate")

        fromDate.clear()
        toDate.clear()

        fromDate.send_keys(year_ago.strftime("%m/%d/%Y"))
        toDate.send_keys(current.strftime("%m/%d/%Y"))

        print("Data from: " + fromDate.get_attribute("value") + " - to: " + toDate.get_attribute("value"))

        current -= timedelta(days=365)

        buttons = driver.find_elements(By.CLASS_NAME, "btn")
        buttons[1].click()

        try:
            WebDriverWait(driver, 1).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
        except TimeoutException:
            break

        table = pd.read_html(driver.page_source)
        print(table)

    driver.close()
    return


def has_digits(string):
    return any(char.isdigit() for char in string)

st = time.time()

response = requests.get("https://www.mse.mk/en/stats/symbolhistory/ALK")

soup = BeautifulSoup(response.text, "html.parser")

codes = soup.select_one("#Code").select("option")

parsedCodes = []

# parsing through all the company codes and adding the to the array
for code in codes:
    if not code.text.startswith("E")  and not has_digits(code.text):
        parsedCodes.append(code.text)

#currently at 5 max, will stress test later
with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
    futures = [
        executor.submit(scrape, f"https://www.mse.mk/en/stats/symbolhistory/{code}")
        for code in parsedCodes
    ]

et = time.time()
total_time = et - st
print("Execution time: ", total_time, "seconds")