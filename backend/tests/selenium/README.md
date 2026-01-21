# Selenium Testovi - Progistanblog Aplikacija

## 📋 Struktura testova

```
backend/tests/selenium/
├── conftest.py                     # Pytest konfiguracija i fiksture
├── config/
│   └── conftest.py                # (legacy - vidi root conftest.py)
├── page_objects/
│   ├── base_page.py              # Bazna klasa za sve page objects
│   ├── login_page.py             # Login stranica
│   ├── home_page.py              # Početna stranica
│   └── admin_page.py             # Admin stranica
├── utilities/
│   ├── wait_helpers.py           # Pomoćne funkcije za čekanje
│   └── screenshot_logger.py      # Snimanje screenshot-a
├── test_cases/
│   ├── test_setup.py             # Osnovni setup testovi
│   ├── test_login.py             # Login testovi
│   ├── test_admin.py             # Admin testovi
│   └── test_discussions.py       # (upcoming) Rasprave testovi
└── reports/
    ├── screenshots/              # Screenshot-ovi iz testova
    ├── logs/                     # Log datoteke
    └── junit_reports/            # JUnit XML izvještaji
```

## 🚀 Kako pokrenuti testove

### Preduvjeti

1. **Python 3.8+** instaliran
2. **Aplikacija pokrenuta** na `http://localhost:5173`
3. **Node.js backend** pokrenuti (ako je potrebno)
4. **Paketi instalirani** (vidjeti dolje)

### Instalacija paketa

```bash
# Idite u project root
cd f:\cod\progi\progiProjekt

# Instalirajte pakete
pip install selenium pytest pytest-html webdriver-manager
```

### Pokretanje testova

#### 1. Pokrenite sve testove
```bash
pytest backend/tests/selenium/test_cases/ -v --html=backend/tests/selenium/reports/report.html
```

#### 2. Pokrenite specifičan test file
```bash
# Samo login testovi
pytest backend/tests/selenium/test_cases/test_login.py -v

# Samo admin testovi
pytest backend/tests/selenium/test_cases/test_admin.py -v

# Samo setup testovi
pytest backend/tests/selenium/test_cases/test_setup.py -v
```

#### 3. Pokrenite specifičan test
```bash
pytest backend/tests/selenium/test_cases/test_login.py::TestLogin::test_TC_LOGIN_001_valid_credentials -v
```

#### 4. Pokrenite sa markerima (po prioritetu)
```bash
# Samo kritični testovi
pytest -m critical -v

# Samo admin testovi
pytest -m admin -v

# Samo login testovi
pytest -m login -v
```

#### 5. Pokrenite sa screenshot-ima i report-ima
```bash
# Sa HTML report-om
pytest backend/tests/selenium/test_cases/ -v --html=backend/tests/selenium/reports/report.html --self-contained-html

# Sa detaljnim logovima
pytest backend/tests/selenium/test_cases/ -v --log-cli-level=DEBUG
```

## 📊 Testni slučajevi

### Login testovi (test_login.py)

| Test ID | Naziv | Prioritet | Ulazi | Očekivani rezultat |
|---------|-------|-----------|-------|-------------------|
| TS_LOGIN_001 | Uspješna prijava sa validnim kredencijalima | Kritičan | Email: user@fer.ugnz.hr, Lozinka: password123 | Korisnik je preusmjeren na početnu stranicu |
| TS_LOGIN_002 | Nevaljana lozinka | Kritičan | Email: user@fer.ugnz.hr, Lozinka: malimedo | Poruka o grešci se prikazuje |
| TS_LOGIN_003 | Prazan email | Visoki | Email: [prazno], Lozinka: password123 | Validacijska poruka se prikazuje |
| TS_LOGIN_004 | Prazna lozinka | Visoki | Email: user@fer.ugnz.hr, Lozinka: [prazna] | Validacijska poruka se prikazuje |
| TS_LOGIN_005 | Nepostojeći korisnik | Srednji | Email: random@example.com, Lozinka: password123 | Login je neuspješan |
| TS_LOGIN_006 | Neispravan format email-a | Srednji | Email: notanemail, Lozinka: password123 | Validacijska poruka se prikazuje |

### Admin testovi (test_admin.py)

| Test ID | Naziv | Prioritet | Ulazi | Očekivani rezultat |
|---------|-------|-----------|-------|-------------------|
| TS_ADMIN_001 | Admin pristup i admin panel dostupan | Kritičan | Email: admin@fer.ugnz.hr, Lozinka: adminpass123 | Admin stranica je dostupna |
| TS_ADMIN_002 | Obični korisnik nema pristupa admin panelu | Kritičan | Email: user@fer.ugnz.hr, Lozinka: password123 | Error 403 ili redirect |
| TS_ADMIN_003 | Admin može pristupiti sekciji korisnika | Srednji | Admin je prijavljen | Sekcija korisnika je dostupna |
| TS_ADMIN_004 | Admin može pristupiti sekciji zgrada | Srednji | Admin je prijavljen | Sekcija zgrada je dostupna |

## 📸 Screenshot-ovi

Svi screenshot-ovi se čuvaju u:
```
backend/tests/selenium/reports/screenshots/YYYYMMDD_HHMMSS/
```

Svaki test generiše screenshot-e sa opisima što se dogodilo.

## 📝 Logovi

Svi logovi se čuvaju u:
```
backend/tests/selenium/reports/logs/pytest.log
```

## 🔍 Izvještaji

Nakon što pokrenete testove sa `--html` opcijom, izvještaj će biti dostupan na:
```
backend/tests/selenium/reports/report.html
```

Otvorite ga u browser-u za detaljne rezultate.

## 🛠️ Troubleshooting

### Greška: "Element not found"
- Provjeri da je aplikacija pokrenuta na `http://localhost:5173`
- Provjerite da su locatori ispravni (možda se HTML struktura promijenila)
- Pokrenite sa `--log-cli-level=DEBUG` za više informacija

### Greška: "Chrome driver not found"
- `webdriver-manager` će automatski preuzeti driver
- Ako to ne radi, ručno preuzmite sa: https://chromedriver.chromium.org/

### Greška: "Connection refused"
- Provjerite da je aplikacija pokrenuta
- Provjerite da ste na pravom port-u (5173 za Vite dev server)

## 📚 Dodatni resursi

- [Selenium dokumentacija](https://www.selenium.dev/documentation/)
- [Pytest dokumentacija](https://docs.pytest.org/)
- [Page Object Pattern](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)

## ✅ Checklist prije testiranja

- [ ] Python 3.8+ instaliran
- [ ] Svi paketi instalirani (`pip install selenium pytest pytest-html webdriver-manager`)
- [ ] Aplikacija pokrenuta na `http://localhost:5173`
- [ ] Test korisnici su dostupni u bazi:
  - [ ] user@fer.ugnz.hr / password123
  - [ ] admin@fer.ugnz.hr / adminpass123
- [ ] WebDriver je dostupan (automatski kroz webdriver-manager)
- [ ] Internet konekcija je dostupna

## 📞 Kontakt i podrška

Ako trebate pomoć, kontaktirajte development tim.
