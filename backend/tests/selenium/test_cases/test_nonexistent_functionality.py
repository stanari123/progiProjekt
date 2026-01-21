import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestNonexistentFunctionality:
    """Test how the application handles calls to non-existent routes/features."""

    def test_TC_NONEXIST_001_nonexistent_route(self, driver, screenshot_dir):
        """Navigate to a clearly non-existent frontend route and expect a 404 or friendly error."""
        url = "http://localhost:5173/nonexistent-route-automated-test-xyz"
        driver.get(url)

        # wait for page load
        WebDriverWait(driver, 5).until(lambda d: d.execute_script("return document.readyState") == "complete")

        page_source = driver.page_source.lower()

        # common indicators of not-found pages
        keywords = ["404", "not found", "stranica nije pronađena", "page not found", "notfound"]

        if any(k in page_source for k in keywords):
            # pass - found indication of missing page
            assert True
        else:
            # save screenshot for debugging
            driver.save_screenshot(f"{screenshot_dir}/nonexistent_route.png")
            pytest.fail("Non-existent route did not show expected 404/friendly error. Screenshot saved.")
