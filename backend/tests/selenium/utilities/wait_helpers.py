from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

class WaitHelper:
    """
    Pomoćne funkcije za čekanje na elemente
    """
    
    @staticmethod
    def wait_for_element(driver, by, value, timeout=10):
        """
        Čeka da element postane dostupan
        """
        return WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
    
    @staticmethod
    def wait_for_clickable(driver, by, value, timeout=10):
        """
        Čeka da element postane klikabilan
        """
        return WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
    
    @staticmethod
    def wait_for_text_in_element(driver, by, value, text, timeout=10):
        """
        Čeka da element sadrži specifičan tekst
        """
        return WebDriverWait(driver, timeout).until(
            EC.text_to_be_present_in_element((by, value), text)
        )
