import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_browser_opens(driver):
    """
    Osnovni test - provjerava da li se browser može otvoriti
    """
    driver.get("https://www.google.com")
    assert "Google" in driver.title
    print("✅ Browser je otvoren i title je ispravan")

def test_app_loads(driver, screenshot_dir):
    """
    Test - provjerava da li se vaša aplikacija učitava
    """
    driver.get("http://localhost:5173")
    
    # Čekajte da se aplikacija učita
    wait = WebDriverWait(driver, 10)
    
    # Provjerite da li se stranica učitala
    try:
        wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Uzmite screenshot
        screenshot_path = f"{screenshot_dir}/app_loaded.png"
        driver.save_screenshot(screenshot_path)
        
        assert "Login" in driver.page_source or "Home" in driver.page_source or "Prijava" in driver.page_source
        print("✅ Aplikacija se uspješno učitala")
        
    except Exception as e:
        driver.save_screenshot(f"{screenshot_dir}/error_app_load.png")
        raise AssertionError(f"Aplikacija se nije mogla učitati: {str(e)}")

def test_login_page_visible(driver, screenshot_dir):
    """
    Test - provjerava je li login forma vidljiva
    """
    driver.get("http://localhost:5173")
    wait = WebDriverWait(driver, 10)
    
    # Pokušaj pronaći email input
    try:
        email_input = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        
        # Pokušaj pronaći password input
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        # Pokušaj pronaći login button
        login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        # Uzmite screenshot
        driver.save_screenshot(f"{screenshot_dir}/login_page_visible.png")
        
        print("✅ Login forma je vidljiva sa svim elementima")
        
    except Exception as e:
        driver.save_screenshot(f"{screenshot_dir}/error_login_page.png")
        raise AssertionError(f"Login forma nije pronađena: {str(e)}")
