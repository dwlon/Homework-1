from bs4 import BeautifulSoup
import requests
from datetime import date, timedelta
from selenium import webdriver
from selenium.common import TimeoutException
from selenium.webdriver.chrome.options import Options
import pandas as pd
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

st = time.time()

chrome_options = Options()

# Uncomment these if you do not want chrome to pop-up
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=chrome_options)

# this is only waiting for clarity when looking at the chrome page, can be removed for faster performance
# driver.implicitly_wait(10)

def has_digits(string):
    return any(char.isdigit() for char in string)

url="https://www.mse.mk/en/stats/symbolhistory/ALK"

response = requests.get(url)

raw_html = response.text

soup = BeautifulSoup(raw_html, "html.parser")

codes = soup.select_one("#Code").select("option")


parsedCodes = []

# parsing through all the company codes and adding the to the array
for code in codes:
    if not code.text.startswith("E")  and not has_digits(code.text):
        parsedCodes.append(code.text)


#  For each Company code
for code in parsedCodes:
    url = "https://www.mse.mk/en/stats/symbolhistory/" + code
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    driver.get(url)

    print(code)

    current = date.today()

# Grabbing data for the last 10 years
    for i in range(0, 10):
        year_ago = current - timedelta(days=364)

        toDate = driver.find_element(By.ID, "ToDate")
        fromDate = driver.find_element(By.ID, "FromDate")

        fromDate.clear()
        toDate.clear()

        fromDate.send_keys(year_ago.strftime("%m/%d/%Y"))
        toDate.send_keys(current.strftime("%m/%d/%Y"))

        print("from: " + fromDate.get_attribute("value") + " - to: " + toDate.get_attribute("value"))

        current -= timedelta(days=364)

        buttons = driver.find_elements(By.CLASS_NAME, "btn")
        buttons[1].click()

        try:
            WebDriverWait(driver, 3).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
        except TimeoutException:
            break

        table = pd.read_html(driver.page_source)
        print(table)

driver.quit()

et = time.time()

total_time = et - st

print("Execution time: ", total_time, "seconds")