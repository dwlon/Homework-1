import concurrent.futures
from datetime import date
from io import StringIO
import requests
from bs4 import BeautifulSoup
import queue
import pandas as pd
import time
from dateutil.relativedelta import relativedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options



def contains_digit(string):
    return any(char.isdigit() for char in string)

def scrape(code, driver):
    driver.get("https://www.mse.mk/en/stats/symbolhistory/" + code)

    currentDate = today

    for i in range(0, 10):
        fromDate = driver.find_element(By.ID, "FromDate")
        toDate = driver.find_element(By.ID, "ToDate")

        fromDate.clear()
        toDate.clear()

        yearAgo = currentDate - relativedelta(years=1) + relativedelta(days=1)

        fromDate.send_keys(yearAgo.strftime("%m/%d/%Y"))
        toDate.send_keys(currentDate.strftime("%m/%d/%Y"))

        currentDate = currentDate - relativedelta(years=1)

        buttons = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "btn"))
        )
        buttons[1].click()

        WebDriverWait(driver, 2).until(EC.presence_of_all_elements_located((By.TAG_NAME, "table")))
        table = pd.read_html(StringIO(driver.page_source))
        print(code)
        print(table)
    return driver

today = date.today()

st = time.time()

if __name__ == '__main__':
    response = requests.get("https://www.mse.mk/en/stats/symbolhistory/ADIN")
    soup = BeautifulSoup(response.text, "html.parser")
    codes = soup.select_one("#Code").select("option")

    q = queue.Queue()

    for c in codes:
        if not c.text.startswith("E") and not contains_digit(c.text):
            q.put(c.text)

    # Running x browsers
    numBrowsers = 6

    chrome_options = Options()
    # Uncomment these if you want the browsers to open
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    drivers = [webdriver.Chrome(options=chrome_options) for _ in range(numBrowsers)]

    with concurrent.futures.ThreadPoolExecutor(max_workers=numBrowsers) as executor:
        futures = {executor.submit(scrape, q.get(), driver): driver for driver in drivers}

        while futures:
            for future in concurrent.futures.as_completed(futures):
                driver = futures.pop(future)

                try:
                    future.result()
                except Exception as e:
                    print(e)

                if not q.empty():
                    c = q.get()
                    futures[executor.submit(scrape, c, driver)] = driver

    for d in drivers:
     d.quit()

et = time.time()
total_time = et - st
print("Execution time: ", total_time, "seconds")