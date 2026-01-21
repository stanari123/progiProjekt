from selenium.webdriver.common.by import By
from .base_page import BasePage

class AdminPage(BasePage):
    """
    Page Object za Admin stranicu
    """
    
    # Locatori
    ADMIN_TITLE = (By.XPATH, "//h1[contains(text(), 'Admin')] | //h2[contains(text(), 'Admin')]")
    USERS_SECTION = (By.XPATH, "//div[contains(@class, 'users')] | //a[contains(text(), 'Korisnici')]")
    BUILDINGS_SECTION = (By.XPATH, "//div[contains(@class, 'buildings')] | //a[contains(text(), 'Zgrade')]")
    DISCUSSIONS_SECTION = (By.XPATH, "//div[contains(@class, 'discussions')] | //a[contains(text(), 'Rasprave')]")
    DELETE_BUTTON = (By.XPATH, "//button[contains(text(), 'Obriši')]")
    EDIT_BUTTON = (By.XPATH, "//button[contains(text(), 'Uredi')]")
    BACK_BUTTON = (By.XPATH, "//button[contains(text(), 'Nazad')] | //a[contains(text(), 'Nazad')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.driver = driver
    
    def wait_for_admin_page(self):
        """Čekaj da se admin stranica učita"""
        self.wait_for_element(*self.ADMIN_TITLE)
        return self
    
    def is_admin_page_loaded(self):
        """Provjeri je li admin stranica učitana"""
        return self.is_element_visible(*self.ADMIN_TITLE)
    
    def click_users_section(self):
        """Klikni na sekciju Korisnici"""
        self.click_element(*self.USERS_SECTION)
        return self
    
    def click_buildings_section(self):
        """Klikni na sekciju Zgrade"""
        self.click_element(*self.BUILDINGS_SECTION)
        return self
    
    def click_discussions_section(self):
        """Klikni na sekciju Rasprave"""
        self.click_element(*self.DISCUSSIONS_SECTION)
        return self
    
    def click_delete(self):
        """Klikni na Obriši"""
        self.click_element(*self.DELETE_BUTTON)
        return self
    
    def click_edit(self):
        """Klikni na Uredi"""
        self.click_element(*self.EDIT_BUTTON)
        return self
    
    def go_back(self):
        """Vrati se nazad"""
        self.click_element(*self.BACK_BUTTON)
        return self
