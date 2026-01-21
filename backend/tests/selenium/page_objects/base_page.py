from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
    """
    Bazna klasa za sve page objects
    """
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
    
    def find_element(self, by, value):
        """Pronađi element"""
        return self.driver.find_element(by, value)
    
    def click_element(self, by, value):
        """Klikni na element"""
        element = self.wait.until(EC.element_to_be_clickable((by, value)))
        element.click()
    
    def send_text(self, by, value, text):
        """Unesi tekst u polje"""
        element = self.wait.until(EC.presence_of_element_located((by, value)))
        element.clear()
        element.send_keys(text)
    
    def get_text(self, by, value):
        """Pročitaj tekst iz elementa"""
        element = self.wait.until(EC.presence_of_element_located((by, value)))
        return element.text
    
    def wait_for_element(self, by, value, timeout=10):
        """Čekaj da se element pojavi"""
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
    
    def is_element_visible(self, by, value):
        """Provjeri je li element vidljiv"""
        try:
            self.wait.until(EC.visibility_of_element_located((by, value)))
            return True
        except:
            return False
