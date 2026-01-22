import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import os
from datetime import datetime

@pytest.fixture(scope="function")
def driver():
    """
    Fikstura koja kreira WebDriver instancu prije svakog testa
    """
    # Kreirajte Chrome opcije
    chrome_options = webdriver.ChromeOptions()
    
    # Opcije
    # chrome_options.add_argument("--headless")  # Bez korisničkog sučelja
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    
    # Kreirajte driver
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=chrome_options
    )
    
    # Timeout za pronalaženje elementa
    driver.implicitly_wait(10)
    
    yield driver
    
    # Zatvori browser nakon testa
    driver.quit()

@pytest.fixture(scope="function")
def screenshot_dir():
    """
    Kreira direktorij za screenshot-e sa datumom
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dir_path = f"backend/tests/selenium/reports/screenshots/{timestamp}"
    os.makedirs(dir_path, exist_ok=True)
    return dir_path
