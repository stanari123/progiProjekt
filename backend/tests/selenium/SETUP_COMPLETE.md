# ✅ SETUP ZAVRŠEN - Selenium Testovi su Spremni!

## 🎉 Čestitamo!

Sve je uspješno postavljeno. Vaš Selenium test projekt je **SPREMAN ZA TESTIRANJE**.

---

## 📦 Što je Instalirano

### Python Paketi
```
✅ selenium              - WebDriver za automatsko testiranje
✅ pytest               - Framework za testove
✅ pytest-html         - HTML report-ovi
✅ webdriver-manager   - Automatska preuzimanja Chrome drivera
```

### Struktura Projekta
```
✅ Page Objects        - 5 datoteka za organizaciju testa
✅ Test Cases          - 4 test datoteke sa 17 testova
✅ Utilities           - Pomoćne funkcije za čekanje i screenshot-e
✅ Konfiguracija       - conftest.py, pytest.ini
✅ Dokumentacija       - 8 markdown datoteka sa detaljnim uputama
✅ Reports            - Direktorij za rezultate testiranja
```

---

## 🎯 Što Trebate Napraviti Sada

### Korak 1: Osigurajte Test Podatke (10 minuta)

Trebate:
- ✅ Obični korisnik: `user@fer.ugnz.hr` / `password123`
- ✅ Admin korisnik: `admin@fer.ugnz.hr` / `adminpass123`

👉 Vidjeti [TEST_DATA.md](backend/tests/selenium/TEST_DATA.md)

### Korak 2: Pokrenite Aplikaciju (30 sekundi)

```powershell
# Terminal 1 - Frontend
cd f:\cod\progi\progiProjekt\front_react
npm run dev

# Terminal 2 - Backend (opciono)
cd f:\cod\progi\progiProjekt\backend
npm start
```

### Korak 3: Pokrenite Testove (3-5 minuta)

```powershell
# Terminal 3
cd f:\cod\progi\progiProjekt

# Pokrenite sve testove sa report-om
pytest backend/tests/selenium/test_cases/ -v --html=backend/tests/selenium/reports/report.html --self-contained-html
```

### Korak 4: Pregledajte Rezultate (5 minuta)

```powershell
# Otvorite HTML report
start backend/tests/selenium/reports/report.html
```

---

## 📚 Dokumentacija

| Dokument | Za Što | Trajanje |
|----------|--------|----------|
| [QUICK_START.md](backend/tests/selenium/QUICK_START.md) | Brzi početak | 5 min |
| [HOW_TO_RUN.md](backend/tests/selenium/HOW_TO_RUN.md) | Detaljne naredbe | 15 min |
| [TEST_CASES_DOCUMENTATION.md](backend/tests/selenium/TEST_CASES_DOCUMENTATION.md) | Detalji testova | 30 min |
| [TEST_DATA.md](backend/tests/selenium/TEST_DATA.md) | Test korisnici i podaci | 10 min |
| [README.md](backend/tests/selenium/README.md) | Kompletan pregled | 20 min |
| [SAMPLE_TEST_REPORT.md](backend/tests/selenium/SAMPLE_TEST_REPORT.md) | Primjer report-a | 10 min |
| [INDEX.md](backend/tests/selenium/INDEX.md) | Pregled strukture | 10 min |

---

## 🎯 Što je Uključeno

### Page Objects (5 datoteka)
```python
✅ BasePage      - Bazna klasa sa korisnim metodama
✅ LoginPage     - Login stranica
✅ HomePage      - Početna stranica
✅ AdminPage     - Admin panel
✅ (Rasprava page - može se dodati)
```

### Test Datoteke (17 testova)
```
✅ test_setup.py         - 3 osnovna testa
✅ test_login.py         - 6 login testova
✅ test_admin.py         - 4 admin testa
✅ test_discussions.py   - 4 rasprave testa
```

### Utilities (2 datoteke)
```
✅ wait_helpers.py       - Čekanje na elemente
✅ screenshot_logger.py  - Snimanje screenshot-a
```

### Konfiguracija
```
✅ conftest.py          - Pytest fiksture i driver setup
✅ pytest.ini           - Pytest konfiguracija
```

---

## 🚀 Tipični Redoslijed Koraka

```
1. Priprema (5 min)
   └─ Pokrenite aplikaciju
   
2. Testiranje (5 min)
   └─ pytest backend/tests/selenium/test_cases/ -v --html=backend/tests/selenium/reports/report.html
   
3. Pregled rezultata (5 min)
   └─ Otvorite HTML report
   
4. Analiza (15 min)
   └─ Pregledajte greške i screenshot-e
   
5. Reportiranje (10 min)
   └─ Dokumentirajte greške u SAMPLE_TEST_REPORT.md formatu

UKUPNO: ~40 minuta
```

---

## ✨ Najbolje Karakteristike Setup-a

### 🎯 Page Object Pattern
- Čistiji kod
- Lakše održavanje
- Ponovna upotreba

### 📸 Automatski Screenshot-ovi
- Za svaki test
- Sa vremenskom oznakom
- Dostupni u report-u

### 📊 HTML Report-ovi
- Lepi prikaz rezultata
- Status svakog testa
- Vrijeme izvršavanja
- Linkovi na screenshot-e

### 🐛 Debug Informacije
- Detaljni logovi
- Error messagi
- Network zahtjevi

### 📚 Detaljnom Dokumentacija
- 8 markdown datoteka
- Primjeri za svaki scenarij
- Troubleshooting savjeti

---

## 🔍 Što Trebate Provjeriti Prije Testiranja

### 1. Aplikacija je dostupna?

```powershell
# U browser
http://localhost:5173

# Trebali bi vidjeti login formu
```

### 2. Test korisnici postoje?

- ✅ user@fer.ugnz.hr / password123
- ✅ admin@fer.ugnz.hr / adminpass123

### 3. Paketi su instalirani?

```powershell
pip list | grep selenium
pip list | grep pytest
```

### 4. Barem jedno rasprave postoji?

```powershell
# Trebalo bi da baza sadrži barem 1 raspravu
```

---

## 🎓 Kako Koristiti Test Projekt

### Za Razvoj Novog Testa

1. Kreirajte novu test datoteku u `test_cases/`
2. Koristite page objects iz `page_objects/`
3. Pokrenite test sa `pytest`
4. Pregledajte rezultate u HTML report-u

### Za Dodavanje Novog Page Object-a

1. Kreirajte novu datoteku u `page_objects/`
2. Naslijedi `BasePage`
3. Definirajte `locators` kao tuple-e
4. Napišite metode za akcije

### Za Promjenu Locator-a

```python
# Primjer - ako se HTML struktura promijeni
# PRIJE:
LOGIN_BUTTON = (By.XPATH, "//button[contains(text(), 'Prijava')]")

# NAKON:
LOGIN_BUTTON = (By.CSS_SELECTOR, ".login-button")
```

---

## ⚡ Brze Naredbe

```bash
# Pokrenite sve testove
pytest backend/tests/selenium/test_cases/ -v

# Pokrenite sa report-om
pytest backend/tests/selenium/test_cases/ -v --html=backend/tests/selenium/reports/report.html --self-contained-html

# Pokrenite specifičan test
pytest backend/tests/selenium/test_cases/test_login.py::TestLogin::test_TC_LOGIN_001_valid_credentials -v

# Pokrenite sa debug logovima
pytest backend/tests/selenium/test_cases/ -v --log-cli-level=DEBUG

# Pokrenite samo kritične testove
pytest backend/tests/selenium/test_cases/ -m critical -v
```

---

## 📊 Očekivani Rezultati

Ako je sve ispravno postavljeno:

```
14 passed in ~2.45s

✅ Svi testovi su prošli
✅ Nema grešaka
✅ HTML report je generiran
✅ Screenshot-ovi su snimljeni
```

---

## 🆘 Ako Nešto Ne Radi

### Greška: "Chrome driver not found"
```powershell
pip install --upgrade webdriver-manager
```

### Greška: "Connection refused" (aplikacija nije pokrenuta)
```powershell
# Pokrenite aplikaciju
cd front_react
npm run dev
```

### Greška: "Element not found"
- Provjerite da je HTML struktura kompatibilna
- Ažurirajte locatorse u page objects

### Greška: "Test timeout"
- Povećajte timeout u `conftest.py`
- Provjerite je li aplikacija spora

---

## 📝 Sažetak Datoteka

### Core Testne Datoteke
- `test_setup.py` - Osnovni testovi za setup provjeru
- `test_login.py` - 6 login testova
- `test_admin.py` - 4 admin testova
- `test_discussions.py` - 4 rasprave testova

### Page Objects
- `base_page.py` - Bazna klasa sa osnovnim metodama
- `login_page.py` - Login interakcije
- `home_page.py` - Home page interakcije
- `admin_page.py` - Admin panel interakcije

### Utilities
- `wait_helpers.py` - Čekanje na elemente
- `screenshot_logger.py` - Snimanje screenshot-a

### Konfiguracija
- `conftest.py` - Pytest fiksture
- `pytest.ini` - Pytest konfiguracija

### Dokumentacija
- `INDEX.md` - Pregled strukture
- `QUICK_START.md` - Brzi početak
- `HOW_TO_RUN.md` - Detaljne naredbe
- `TEST_CASES_DOCUMENTATION.md` - Detalji testova
- `TEST_DATA.md` - Test podaci
- `README.md` - Kompletan pregled
- `SAMPLE_TEST_REPORT.md` - Primjer report-a

---

## 🎉 SPREMAN ZA TESTIRANJE!

Sve je postavljeno i sprema je. Pokrenite testove i počnite sa testiranjem:

```bash
pytest backend/tests/selenium/test_cases/ -v --html=backend/tests/selenium/reports/report.html --self-contained-html
```

**Sretno testiranje!** 🚀

---

**Setup Dokument**  
**Verzija:** 1.0  
**Datum:** 21.01.2026  
**Status:** ✅ SPREMAN ZA TESTIRANJE
