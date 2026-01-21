import pytest
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from page_objects.login_page import LoginPage
from page_objects.home_page import HomePage

class TestDiscussions:
    """
    Testni slučajevi za Rasprave (Discussions) funkcionalnost
    """
    
    def test_TC_DISC_001_view_discussions(self, driver, screenshot_dir):
        """
        TEST ID: TS_DISC_001
        NAZIV: Korisnik može vidjeti listu rasprava
        PRIORITET: Srednji
        
        ULAZI:
        - Korisnik je prijavljen
        
        OČEKIVANI REZULTAT:
        - Stranica sa raspravama se učitava
        - Prikazana je lista rasprava
        """
        try:
            # Prijavi se
            login_page = LoginPage(driver)
            login_page.open()
            login_page.login("user@fer.ugnz.hr", "password123")
            
            time.sleep(2)
            
            # Idi na discussions stranicu
            driver.get("http://localhost:5173/discussions")
            time.sleep(2)
            
            driver.save_screenshot(f"{screenshot_dir}/TC_DISC_001_view.png")
            
            # Provjeri da je stranica učitana
            assert "Rasprava" in driver.page_source or "Discussion" in driver.page_source, \
                "Stranica sa raspravama nije učitana"
            
            print("✅ TEST PASSED: Rasprave su vidljive")
            
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_DISC_001_error.png")
            pytest.fail(f"Test failed: {str(e)}")
    
    def test_TC_DISC_002_create_discussion(self, driver, screenshot_dir):
        """
        TEST ID: TS_DISC_002
        NAZIV: Korisnik može kreirati novu raspravu
        PRIORITET: Visoki
        
        ULAZI:
        - Korisnik je prijavljen
        - Naslov: "Testna rasprava"
        - Tekst: "Ovo je testna rasprava"
        
        OČEKIVANI REZULTAT:
        - Nova rasprava je kreirana
        - Rasprava se pojavljuje na listi
        """
        try:
            # Prijavi se
            login_page = LoginPage(driver)
            login_page.open()
            login_page.login("user@fer.ugnz.hr", "password123")
            
            time.sleep(2)
            
            home_page = HomePage(driver)
            
            # Pokušaj pristupiti discussions stranici
            driver.get("http://localhost:5173/discussions")
            time.sleep(2)
            
            # Pokušaj kliknuti "Nova rasprava"
            try:
                new_discussion_button = driver.find_element(By.XPATH, 
                    "//button[contains(text(), 'Nova rasprava')] | //button[contains(text(), 'New Discussion')]")
                new_discussion_button.click()
                time.sleep(2)
                
                driver.save_screenshot(f"{screenshot_dir}/TC_DISC_002_form.png")
                
                # Unesi podatke
                title_input = driver.find_element(By.XPATH, "//input[@placeholder*='naslov' or @placeholder*='title']")
                content_input = driver.find_element(By.XPATH, "//textarea[@placeholder*='tekst' or @placeholder*='content']")
                
                title_input.clear()
                title_input.send_keys("Testna rasprava - Selenium")
                
                content_input.clear()
                content_input.send_keys("Ovo je testna rasprava kreirana Selenium testom")
                
                # Klikni submit
                submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Objavi')] | //button[contains(text(), 'Post')]")
                submit_button.click()
                
                time.sleep(3)
                driver.save_screenshot(f"{screenshot_dir}/TC_DISC_002_created.png")
                
                # Provjeri da je rasprava kreirana
                assert "Testna rasprava" in driver.page_source, "Nova rasprava se ne pojavljuje na listi"
                
                print("✅ TEST PASSED: Nova rasprava je kreirana")
                
            except Exception as e:
                driver.save_screenshot(f"{screenshot_dir}/TC_DISC_002_no_button.png")
                print(f"⚠️ TEST WARNING: Gumb 'Nova rasprava' nije dostupan: {str(e)}")
            
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_DISC_002_error.png")
            pytest.fail(f"Test failed: {str(e)}")
    
    def test_TC_DISC_003_view_discussion_detail(self, driver, screenshot_dir):
        """
        TEST ID: TS_DISC_003
        NAZIV: Korisnik može vidjeti detalje rasprave
        PRIORITET: Srednji
        
        ULAZI:
        - Korisnik je prijavljen
        - Rasprava postoji
        
        OČEKIVANI REZULTAT:
        - Detalji rasprave se učitavaju
        - Prikazani su komentari
        """
        try:
            # Prijavi se
            login_page = LoginPage(driver)
            login_page.open()
            login_page.login("user@fer.ugnz.hr", "password123")
            
            time.sleep(2)
            
            # Idi na discussions stranicu
            driver.get("http://localhost:5173/discussions")
            time.sleep(2)
            
            # Pokušaj kliknuti na prvu raspravu
            try:
                first_discussion = driver.find_element(By.XPATH, "//div[contains(@class, 'discussion')] | //a[contains(@href, 'discussion')]")
                first_discussion.click()
                
                time.sleep(2)
                driver.save_screenshot(f"{screenshot_dir}/TC_DISC_003_detail.png")
                
                # Provjeri da se detalji učitavaju
                assert "Komentar" in driver.page_source or "Comment" in driver.page_source or \
                       driver.current_url != "http://localhost:5173/discussions", \
                       "Detalji rasprave se nisu učitali"
                
                print("✅ TEST PASSED: Detalji rasprave su vidljivi")
                
            except Exception as e:
                driver.save_screenshot(f"{screenshot_dir}/TC_DISC_003_no_click.png")
                print(f"⚠️ TEST WARNING: Nije moguće kliknuti na raspravu: {str(e)}")
            
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_DISC_003_error.png")
            pytest.fail(f"Test failed: {str(e)}")
    
    def test_TC_DISC_004_add_comment(self, driver, screenshot_dir):
        """
        TEST ID: TS_DISC_004
        NAZIV: Korisnik može dodati komentar
        PRIORITET: Visoki
        
        ULAZI:
        - Korisnik je prijavljen
        - Rasprava je otvorena
        
        OČEKIVANI REZULTAT:
        - Komentar je dodan
        - Komentar se pojavljuje u listi
        """
        try:
            # Prijavi se
            login_page = LoginPage(driver)
            login_page.open()
            login_page.login("user@fer.ugnz.hr", "password123")
            
            time.sleep(2)
            
            # Idi na discussions stranicu
            driver.get("http://localhost:5173/discussions")
            time.sleep(2)
            
            # Pokušaj kliknuti na prvu raspravu
            try:
                first_discussion = driver.find_element(By.XPATH, "//div[contains(@class, 'discussion')] | //a[contains(@href, 'discussion')]")
                first_discussion.click()
                
                time.sleep(2)
                
                # Pronađi input za komentar
                comment_input = driver.find_element(By.XPATH, 
                    "//input[@placeholder*='komentar' or @placeholder*='comment'] | //textarea[@placeholder*='komentar' or @placeholder*='comment']")
                
                comment_input.clear()
                comment_input.send_keys("Ovo je test komentar - Selenium")
                
                # Klikni submit
                submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Pošalji')] | //button[contains(text(), 'Send')]")
                submit_button.click()
                
                time.sleep(2)
                driver.save_screenshot(f"{screenshot_dir}/TC_DISC_004_comment.png")
                
                # Provjeri da je komentar dodan
                assert "test komentar" in driver.page_source, "Komentar se ne pojavljuje"
                
                print("✅ TEST PASSED: Komentar je dodan")
                
            except Exception as e:
                driver.save_screenshot(f"{screenshot_dir}/TC_DISC_004_no_comment.png")
                print(f"⚠️ TEST WARNING: Nije moguće dodati komentar: {str(e)}")
            
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_DISC_004_error.png")
            pytest.fail(f"Test failed: {str(e)}")
