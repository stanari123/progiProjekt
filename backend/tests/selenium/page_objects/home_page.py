from selenium.webdriver.common.by import By
from .base_page import BasePage

class HomePage(BasePage):
    """
    Page Object za početnu stranicu
    """
    
    # Locatori
    USER_PROFILE = (By.XPATH, "//div[contains(@class, 'profile')] | //span[contains(text(), '@')]")
    LOGOUT_BUTTON = (By.XPATH, "//button[contains(text(), 'Odjava')] | //a[contains(text(), 'Odjava')]")
    DISCUSSIONS_LINK = (By.XPATH, "//a[contains(text(), 'Rasprave')] | //link[contains(@href, 'discussions')]")
    BUILDINGS_LINK = (By.XPATH, "//a[contains(text(), 'Zgrade')] | //link[contains(@href, 'buildings')]")
    NEW_DISCUSSION_BUTTON = (By.XPATH, "//button[contains(text(), 'Nova rasprava')]")
    ADMIN_LINK = (By.XPATH, "//a[contains(text(), 'Admin')] | //link[contains(@href, 'admin')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.driver = driver
    
    def wait_for_home_page(self):
        """Čekaj da se home stranica učita"""
        self.wait_for_element(*self.USER_PROFILE)
        return self
    
    def get_logged_in_user(self):
        """Uzmi data logged in korisnika"""
        if self.is_element_visible(*self.USER_PROFILE):
            return self.get_text(*self.USER_PROFILE)
        return None
    
    def logout(self):
        """Odjava korisnika"""
        self.click_element(*self.LOGOUT_BUTTON)
        return self
    
    def click_discussions(self):
        """Klikni na Rasprave"""
        self.click_element(*self.DISCUSSIONS_LINK)
        return self
    
    def click_buildings(self):
        """Klikni na Zgrade"""
        self.click_element(*self.BUILDINGS_LINK)
        return self
    
    def click_admin(self):
        """Klikni na Admin"""
        self.click_element(*self.ADMIN_LINK)
        return self
    
    def click_new_discussion(self):
        """Klikni na Nova rasprava"""
        self.click_element(*self.NEW_DISCUSSION_BUTTON)
        return self
    
    def is_home_page_loaded(self):
        """Provjeri je li home stranica učitana"""
        return self.is_element_visible(*self.USER_PROFILE)
