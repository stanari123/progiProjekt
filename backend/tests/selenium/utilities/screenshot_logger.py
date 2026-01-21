from datetime import datetime
import os

class ScreenshotLogger:
    """
    Pomoćna klasa za snimanje screenshot-a
    """
    
    @staticmethod
    def take_screenshot(driver, screenshot_dir, test_name):
        """
        Snima screenshot i čuva ga sa datumom i imenom testa
        """
        timestamp = datetime.now().strftime("%H%M%S")
        filename = f"{test_name}_{timestamp}.png"
        filepath = os.path.join(screenshot_dir, filename)
        
        driver.save_screenshot(filepath)
        print(f"Screenshot saved: {filepath}")
        
        return filepath
