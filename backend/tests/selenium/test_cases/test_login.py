import pytest
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# Import page objects
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from page_objects.login_page import LoginPage
from page_objects.home_page import HomePage

class TestLogin:
    """
    Testni slučajevi za Login funkcionalnost
    """
    
    def test_TC_LOGIN_001_valid_credentials(self, driver, screenshot_dir):
        """
        TEST ID: TS_LOGIN_001
        NAZIV: Uspješna prijava sa validnim kredencijalima
        PRIORITET: Kritičan
        
        ULAZI:
        - Email: user@fer.ugnz.hr
        - Lozinka: password123
        
        OČEKIVANI REZULTAT:
        - Korisnik je preusmjeren na početnu stranicu
        - Sesija je aktivna
        """
        try:
            # Inicijalizuj login stranicu
            login_page = LoginPage(driver)
            login_page.open()
            
            # Provjeri da je login forma vidljiva
            assert login_page.is_login_button_visible(), "Login gumb nije vidljiv"
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_001_start.png")
            
            # Unesi podatke i prijavi se
            login_page.login("user@fer.ugnz.hr", "password123")
            
            # Čekaj da se stranica učita
            wait = WebDriverWait(driver, 10)
            wait.until(EC.url_changes(driver.current_url))
            
            # Uzmite screenshot nakon logina
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_001_success.png")
            
            # Provjeri da je korisnik na početnoj stranici
            current_url = driver.current_url
            assert "login" not in current_url.lower(), f"Korisnik je još uvijek na login stranici: {current_url}"
            
            print("✅ TEST PASSED: Uspješna prijava")
            
        except AssertionError as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_001_failed.png")
            pytest.fail(f"Test failed: {str(e)}")
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_001_error.png")
            pytest.fail(f"Unexpected error: {str(e)}")
    
    def test_TC_LOGIN_002_invalid_password(self, driver, screenshot_dir):
        """
        TEST ID: TS_LOGIN_002
        NAZIV: Nevaljana lozinka (Rubni uvjet)
        PRIORITET: Kritičan
        
        ULAZI:
        - Email: user@fer.ugnz.hr
        - Lozinka: malimedo
        
        OČEKIVANI REZULTAT:
        - Prikazana poruka o grešci
        - Korisnik ostaje na login stranici
        """
        try:
            login_page = LoginPage(driver)
            login_page.open()
            
            # Unesi krive podatke
            login_page.login("user@fer.ugnz.hr", "malimedo")
            
            # Čekaj da se error prikaže
            time.sleep(2)
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_002_error.png")
            
            # Provjeri da je poruka o grešci vidljiva
            error_message = login_page.get_error_message()
            
            if error_message:
                assert "Pogrešno" in error_message or "grešk" in error_message.lower(), \
                    f"Neočekivana poruka: {error_message}"
                print(f"✅ TEST PASSED: Error message prikazan: {error_message}")
            else:
                # Provjeri da je korisnik još na login stranici
                assert "login" in driver.current_url.lower(), "Korisnik nije na login stranici"
                print("✅ TEST PASSED: Korisnik ostaje na login stranici")
            
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_002_error_unexpected.png")
            pytest.fail(f"Test failed: {str(e)}")
    
    def test_TC_LOGIN_003_empty_email(self, driver, screenshot_dir):
        """
        TEST ID: TS_LOGIN_003
        NAZIV: Prazan email (Rubni uvjet)
        PRIORITET: Visoki
        
        ULAZI:
        - Email: [prazno]
        - Lozinka: password123
        
        OČEKIVANI REZULTAT:
        - Validacijska poruka "Email je obavezan"
        - Zahtjev nije poslan na server
        """
        try:
            login_page = LoginPage(driver)
            login_page.open()
            
            # Preskočи email i unesi samo lozinku
            login_page.enter_password("password123")
            login_page.click_login()
            
            time.sleep(1)
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_003_validation.png")
            
            # Provjeri da je korisnik još na login stranici (nije se zahtjev poslao)
            assert "login" in driver.current_url.lower(), "Zahtjev je poslan bez email-a"
            
            print("✅ TEST PASSED: Validacija email-a je uključena")
            
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_003_error.png")
            pytest.fail(f"Test failed: {str(e)}")
    
    def test_TC_LOGIN_004_empty_password(self, driver, screenshot_dir):
        """
        TEST ID: TS_LOGIN_004
        NAZIV: Prazna lozinka (Rubni uvjet)
        PRIORITET: Visoki
        
        ULAZI:
        - Email: user@fer.ugnz.hr
        - Lozinka: [prazna]
        
        OČEKIVANI REZULTAT:
        - Validacijska poruka "Lozinka je obavezna"
        - Zahtjev nije poslan
        """
        try:
            login_page = LoginPage(driver)
            login_page.open()
            
            # Unesi samo email
            login_page.enter_email("user@fer.ugnz.hr")
            login_page.click_login()
            
            time.sleep(1)
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_004_validation.png")
            
            # Provjeri da je korisnik još na login stranici
            assert "login" in driver.current_url.lower(), "Zahtjev je poslan bez lozinke"
            
            print("✅ TEST PASSED: Validacija lozinke je uključena")
            
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_004_error.png")
            pytest.fail(f"Test failed: {str(e)}")
    
    def test_TC_LOGIN_005_nonexistent_user(self, driver, screenshot_dir):
        """
        TEST ID: TS_LOGIN_005
        NAZIV: Nepostojeći korisnik
        PRIORITET: Srednji
        
        ULAZI:
        - Email: random123456@example.com
        - Lozinka: password123
        
        OČEKIVANI REZULTAT:
        - Poruka o grešci "Korisnik nije pronađen" ili sličnog
        - Login neuspješan
        """
        try:
            login_page = LoginPage(driver)
            login_page.open()
            
            # Unesi podatke nepostoječeg korisnika
            login_page.login("random123456@example.com", "password123")
            
            time.sleep(2)
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_005_nonexistent.png")
            
            # Provjeri da je poruka o grešci vidljiva
            error_message = login_page.get_error_message()
            
            if error_message:
                print(f"✅ TEST PASSED: Error message: {error_message}")
            else:
                # Provjeri da je korisnik na login stranici
                assert "login" in driver.current_url.lower(), "Login je bio uspješan sa nepostoječim korisnikom"
                print("✅ TEST PASSED: Login je neuspješan sa nepostoječim korisnikom")
            
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_005_error.png")
            pytest.fail(f"Test failed: {str(e)}")
    
    def test_TC_LOGIN_006_invalid_email_format(self, driver, screenshot_dir):
        """
        TEST ID: TS_LOGIN_006
        NAZIV: Neispravan format email-a
        PRIORITET: Srednji
        
        ULAZI:
        - Email: notanemail
        - Lozinka: password123
        
        OČEKIVANI REZULTAT:
        - Validacijska poruka "Neispravan format email-a"
        - Zahtjev nije poslan
        """
        try:
            login_page = LoginPage(driver)
            login_page.open()
            
            login_page.enter_email("notanemail")
            login_page.enter_password("password123")
            login_page.click_login()
            
            time.sleep(1)
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_006_email_format.png")
            
            # Provjeri da je korisnik na login stranici
            assert "login" in driver.current_url.lower(), "Zahtjev je poslan sa neispravnom email-om"
            
            print("✅ TEST PASSED: Validacija email formata je uključena")
            
        except Exception as e:
            driver.save_screenshot(f"{screenshot_dir}/TC_LOGIN_006_error.png")
            pytest.fail(f"Test failed: {str(e)}")
