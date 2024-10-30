from bs4 import BeautifulSoup
import requests
from datetime import date, timedelta
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import pandas as pd

chrome_options = Options()
chrome_options.add_argument("--headless")

driver = webdriver.Chrome(options=chrome_options)

def has_digits(string):
    return any(char.isdigit() for char in string)

url="https://www.mse.mk/en/stats/symbolhistory/ALK"

response = requests.get(url)

raw_html = response.text

soup = BeautifulSoup(raw_html, "html.parser")

codes = soup.select_one("#Code").select("option")

# parsedCodes currently has 1 code for testing
parsedCodes = ["ADIN"]

# parsing through all the company codes and adding the to the array
# for code in codes:
#     if not code.text.startswith("E")  and not has_digits(code.text):
#         parsedCodes.append(code.text)


#  For each Company code
for code in parsedCodes:
    url = "https://www.mse.mk/en/stats/symbolhistory/" + code
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    driver.get(url)

    current = date.today()

    toDate = soup.select_one("#ToDate")
    fromDate = soup.select_one("#FromDate")

    # Trying to go back 2 years for testing purposes
    for i in range(0, 2):
        year_ago = current - timedelta(days=364)

        fromDate['value'] = year_ago.strftime("%m/%d/%Y")
        toDate['value'] = current.strftime("%m/%d/%Y")

        print("from" + fromDate.get('value') + " to" + toDate.get('value'))

        current -= timedelta(days=365)

        driver.execute_script("btnClick();")

        table = pd.read_html(driver.current_url)
        print(table)




