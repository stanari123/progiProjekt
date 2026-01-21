# 🚀 Quick Start - Selenium Testovi

## ⚡ 3 minuta za start

### 1️⃣ Instalirajte pakete (1 minuta)

```powershell
cd f:\cod\progi\progiProjekt
pip install selenium pytest pytest-html webdriver-manager
```

### 2️⃣ Pokrenite SAMO Frontend (30 sekundi)

**Terminal 1 - Frontend (OBAVEZNO):**
```powershell
cd f:\cod\progi\progiProjekt\front_react
npm run dev
```

Trebali bi vidjeti:
```
➜  Local:   http://localhost:5173/
```

> **Napomena:** Backend je OPCIJSKI - trebate ga samo ako trebate testirati login funkcionalnost sa pravim podacima. Za sada možete testirati frontend bez backend-a.

### 3️⃣ Pokrenite testove (1.5 minuta)

```powershell
cd f:\cod\progi\progiProjekt

# Pokrenite samo SETUP testove (ne trebaju login kredencijali)
pytest backend/tests/selenium/test_cases/test_setup.py -v

# ILI ako trebate testirati login, trebate backend sa .env datotekama
# pytest backend/tests/selenium/test_cases/test_login.py -v
```

## 📊 Rezultati

Nakon testiranja, trebali bi vidjeti u terminal-u:

```
======================== test session starts =========================
collected 3 items

test_setup.py::test_browser_opens PASSED                     [33%]
test_setup.py::test_app_loads PASSED                         [66%]
test_setup.py::test_login_page_visible PASSED                [100%]

==================== 3 passed in 45s ============================
```

**Što pokazuje:**
- ✅ Browser se može otvoriti
- ✅ Aplikacija se učitava na http://localhost:5173
- ✅ Login forma je vidljiva

---

## 🔐 Za Login Testove (Trebate Backend)

Ako trebate testirati login funkcionalnost sa pravim podacima:

1. Kreirajte `.env` datoteku u `backend/` direktoriju:
   ```env
   SUPABASE_URL=vaš-supabase-url
   SUPABASE_ANON_KEY=vaš-anon-key
   PORT=3001
   ```

2. Pokrenite backend u drugom terminal-u:
   ```powershell
   cd f:\cod\progi\progiProjekt\backend
   npm start
   ```

3. Tada pokrenite login testove:
   ```powershell
   pytest backend/tests/selenium/test_cases/test_login.py -v
   ```

## 🎯 Česti commandos

```bash
# Samo kritični testovi
pytest -m critical -v

# Samo login testovi
pytest -m login -v

# Samo admin testovi
pytest -m admin -v

# Sa debug logovima
pytest -v --log-cli-level=DEBUG

# Specifičan test
pytest backend/tests/selenium/test_cases/test_login.py::TestLogin::test_TC_LOGIN_001_valid_credentials -v

# Sa screenshot-ima
pytest -v --screenshots

# Bez headless (vidite browser!)
pytest -v --no-headless
```

## 📋 Test podatke trebate

**ZA SETUP TESTOVE - NISU POTREBNI PODACI**
- ✅ Testovi rade bez login podataka
- ✅ Testovi samo provjeravaju da se aplikacija učita

**ZA LOGIN TESTOVE - TREBATE TEST KORISNIKE U BAZI:**

| Email | Lozinka | Uloga |
|-------|---------|-------|
| user@fer.ugnz.hr | password123 | Obični korisnik |
| admin@fer.ugnz.hr | adminpass123 | Admin |

> Ovi korisnici trebaju biti u vašoj bazi podataka (ili kreirajte ih ručno)

## 🔍 Troubleshooting

| Problem | Rješenje |
|---------|---------|
| "Chrome driver not found" | `pip install webdriver-manager` će ga preuzeti |
| "Connection refused" | Provjerite da je aplikacija pokrenuta na http://localhost:5173 |
| "Element not found" | Provjerite da je HTML struktura aplikacije kompatibilna sa locatorima |
| "Test je timeout" | Povećajte timeout u conftest.py ili čekajte malo aplikaciju |

## 📝 Struktura test rezultata

```
backend/tests/selenium/reports/
├── report.html              # HTML report (otvori u browser-u!)
├── logs/
│   └── pytest.log          # Detaljni logovi
└── screenshots/
    ├── 20260121_120000/
    │   ├── TC_LOGIN_001_start.png
    │   ├── TC_LOGIN_001_success.png
    │   └── TC_LOGIN_001_error.png
    └── ... (više timestamp direktorija)
```

## ✅ Checklist prije testiranja

- [ ] Python instaliran (`python --version`)
- [ ] Paketi instalirani (`pip install selenium pytest pytest-html webdriver-manager`)
- [ ] Aplikacija pokrenuta na `http://localhost:5173`
- [ ] Test korisnici dostupni u bazi
- [ ] WebDriver je dostupan (automatski kroz webdriver-manager)

## 📞 Potrebna pomoć?

Vidjeti:
- [README.md](./README.md) - Detaljne upute
- [TEST_CASES_DOCUMENTATION.md](./TEST_CASES_DOCUMENTATION.md) - Detaljan opis testnih slučajeva
- [page_objects/](./page_objects/) - Page objects za testiranje

---

**Za početak, samo pokrenite:**
```bash
pytest backend/tests/selenium/test_cases/test_setup.py -v
```

To će pokazati je li okruženje ispravno konfigurirano! 🎉
