from selenium.webdriver.common.by import By
from .base_page import BasePage

class LoginPage(BasePage):
    """
    Page Object za Login stranicu
    """
    
    # Locatori
    EMAIL_INPUT = (By.CSS_SELECTOR, "input[type='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[type='password']")
    LOGIN_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".error-message, .alert-danger, [role='alert']")
    GOOGLE_LOGIN_BUTTON = (By.XPATH, "//button[contains(text(), 'Google')]")
    FORGOT_PASSWORD_LINK = (By.XPATH, "//a[contains(text(), 'Zaboravljena')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.driver = driver
    
    def open(self, url="http://localhost:5173"):
        """Otvori login stranicu"""
        self.driver.get(url)
        return self
    
    def enter_email(self, email):
        """Unesi email"""
        self.send_text(*self.EMAIL_INPUT, email)
        return self
    
    def enter_password(self, password):
        """Unesi lozinku"""
        self.send_text(*self.PASSWORD_INPUT, password)
        return self
    
    def click_login(self):
        """Klikni na Prijava gumb"""
        self.click_element(*self.LOGIN_BUTTON)
        return self
    
    def login(self, email, password):
        """Kompletan login proces"""
        self.enter_email(email)
        self.enter_password(password)
        self.click_login()
        return self
    
    def get_error_message(self):
        """Uzmi poruku o greški"""
        if self.is_element_visible(*self.ERROR_MESSAGE):
            return self.get_text(*self.ERROR_MESSAGE)
        return None
    
    def is_login_button_visible(self):
        """Provjeri je li login gumb vidljiv"""
        return self.is_element_visible(*self.LOGIN_BUTTON)
