# 🎯 KAKO POKRENUTI TESTOVE - Detaljne Naredbe

## 📌 PREDUVJETI - što trebate prije početka

Provjerite sljedeće naredbe u PowerShell:

```powershell
# 1. Provjerite Python
python --version
# Trebate: Python 3.8+ (Preporučujem 3.12)

# 2. Provjerite npm/Node
node --version
npm --version
# Trebate: Node 16+

# 3. Provjerite Internet konekciju
ping google.com
```

---

## 🚀 POKRETANJE TESTOVA - Korak po korak

### Korak 1: Idite u projekt direktorij

```powershell
cd f:\cod\progi\progiProjekt
```

### Korak 2: Instalirajte Python pakete (samo prvi put)

```powershell
# Instalirajte sve potrebne pakete
pip install selenium pytest pytest-html webdriver-manager

# Provjerite instalaciju
# PowerShell: provjerite instalirane pakete
pip list | Select-String selenium
pip list | Select-String pytest
```

### Korak 3: Pokrenite aplikaciju

Trebate da bude aplikacija pokrenuta na `http://localhost:5173`

**U Terminal 1 - Frontend Vite server:**
```powershell
cd f:\cod\progi\progiProjekt\front_react
npm run dev
```

Trebali bi vidjeti:
```
VITE v4.5.0  ready in 200 ms

➜  Local:   http://localhost:5173/
```

**U Terminal 2 - Backend (ako trebate):**
```powershell
cd f:\cod\progi\progiProjekt\backend
npm start
# ili ako koristite nodemon:
nodemon server.js
```

### Korak 4: U novom Terminal 3 - Pokrenite testove

```powershell
cd f:\cod\progi\progiProjekt

# OPCIJA A: Pokrenite sve testove sa HTML report-om
pytest backend/tests/selenium/test_cases/ -v --html=backend/tests/selenium/reports/report.html --self-contained-html

# OPCIJA B: Pokrenite samo osnovne testove (setup)
pytest backend/tests/selenium/test_cases/test_setup.py -v

# OPCIJA C: Pokrenite samo login testove
pytest backend/tests/selenium/test_cases/test_login.py -v

# OPCIJA D: Pokrenite samo admin testove
pytest backend/tests/selenium/test_cases/test_admin.py -v

# OPCIJA E: Pokrenite samo rasprave testove
pytest backend/tests/selenium/test_cases/test_discussions.py -v
```

---

## 🎬 PRIMJERI IZVRŠAVANJA

### Primjer 1: Pokrenite samo jedan test

```powershell
# Pokrenite specifičan test
pytest backend/tests/selenium/test_cases/test_login.py::TestLogin::test_TC_LOGIN_001_valid_credentials -v

# Trebali bi vidjeti:
# test_login.py::TestLogin::test_TC_LOGIN_001_valid_credentials PASSED [100%]
```

### Primjer 2: Pokrenite testove sa detaljnim logovima

```powershell
# Sa debug output-om
pytest backend/tests/selenium/test_cases/test_setup.py -v --log-cli-level=DEBUG

# Trebali bi vidjeti mnogo informacija o čemu se test radi
```

### Primjer 3: Pokrenite testove sa markerima

```powershell
# Samo kritični testovi
pytest backend/tests/selenium/test_cases/ -m critical -v

# Samo login testovi
pytest backend/tests/selenium/test_cases/ -m login -v

# Samo admin testovi
pytest backend/tests/selenium/test_cases/ -m admin -v
```

### Primjer 4: Pokrenite testove sa timeout-om

```powershell
# Ako test traje duže od 30 sekundi, test pada
pytest backend/tests/selenium/test_cases/ -v --timeout=30
```

### Primjer 5: Pokrenite testove sa reportom

```powershell
# HTML report sa svim detaljima
pytest backend/tests/selenium/test_cases/ -v --html=backend/tests/selenium/reports/report.html --self-contained-html

# Nakon što je gotovo, otvorite:
start backend/tests/selenium/reports/report.html
```

---

## 📊 NAKON TESTIRANJA

### Gdje vidjeti rezultate?

```powershell
# 1. HTML Report (otvorite u browser-u)
backend/tests/selenium/reports/report.html

# 2. Logovi
backend/tests/selenium/reports/logs/pytest.log

# 3. Screenshot-ovi
backend/tests/selenium/reports/screenshots/[timestamp]/
```

### Kako otvoriti HTML report?

```powershell
# Automatski otvorite u browser-u
start backend/tests/selenium/reports/report.html
```

---

## 🔧 NAPREDNE OPCIJE

### Pokrenite testove bez da vidite browser (headless mode)

```powershell
# Otvorite conftest.py i uncomment line:
# chrome_options.add_argument("--headless")

# Testovi će biti brži, ali nećete vidjeti browser
```

### Pokrenite testove sa video snimkom

```powershell
# (Trebate nainstalirati pytest-video)
pip install pytest-video

# Pokrenite testove
pytest backend/tests/selenium/test_cases/ -v --video=on
```

### Pokrenite testove u paralelnom modu

```powershell
# Trebate nainstalirati:
pip install pytest-xdist

# Pokrenite 4 testa istovremeno
pytest backend/tests/selenium/test_cases/ -v -n 4
```

---

## 🐛 DEBUGGING - Ako test pada

### Što trebate provjeriti?

1. **Aplikacija je pokrenuta?**
   ```powershell
   # U browser, idite na:
   http://localhost:5173
   
   # Trebala bi biti vidljiva login forma
   ```

2. **Čitljivi su logovi?**
   ```powershell
   # Pokrenite test saDebugING logovima
   pytest backend/tests/selenium/test_cases/test_setup.py -v --log-cli-level=DEBUG
   ```

3. **Postoje li screenshot-ovi?**
   ```powershell
   # Otvorite screenshot direktorij
   explorer backend/tests/selenium/reports/screenshots
   ```

4. **Koji je točan error?**
   ```powershell
   # Pokrenite test sa kratkim traceback-om
   pytest backend/tests/selenium/test_cases/test_setup.py -v --tb=short
   ```

---

## ✅ CHECKLIST PRIJE TESTIRANJA

Prije nego što pokrenete testove, provjerite:

- [ ] Python je instaliran (`python --version`)
- [ ] Paketi su instalirani (`pip list | grep selenium`)
- [ ] Aplikacija je pokrenuta na `http://localhost:5173`
- [ ] Backend je pokrenuti (ako trebate)
- [ ] WebDriver je dostupan (automatski preko webdriver-manager)
- [ ] Test korisnici postoje u bazi:
  - [ ] user@fer.ugnz.hr / password123
  - [ ] admin@fer.ugnz.hr / adminpass123

---

## 🎓 DODATNO UČENJE

Vidjeti:
1. [README.md](./README.md) - Detaljne upute
2. [QUICK_START.md](./QUICK_START.md) - Brzi start
3. [TEST_CASES_DOCUMENTATION.md](./TEST_CASES_DOCUMENTATION.md) - Popis svih testova
4. [SAMPLE_TEST_REPORT.md](./SAMPLE_TEST_REPORT.md) - Primjer report-a

---

## 📝 VAŽNE NAPOMENE

### Što se dogodi tijekom testa?

1. Selenium otvara Chrome browser
2. Browser ide na `http://localhost:5173`
3. Selenium klikće na element-e, unosi podatke, i provjerava rezultate
4. Browser se automatski zatvara na kraju testa
5. Screenshot-ovi se spremaju u `/reports/screenshots/`

### Biti strpljiv!

- Prvi test može potrajati 10-15 sekundi (preuzimanje WebDriver-a)
- Subsequent testovi su brži (5-20 sekundi po testu)
- Ukupno vrijeme za sve testove: ~3-5 minuta

### Što trebate znati?

- ✅ Testovi mogu biti pokrenuti više puta
- ✅ Testovi se mogu pokrenuti odjednom ili pojedinačno
- ✅ Screenshot-ovi se čuvaju i mogu se pregledati nakon
- ⚠️ Testovi trebaju pristup internet (za WebDriver preuuzimanje)
- ⚠️ Ako aplikacija pada, testovi će padati

---

## 🎉 READY TO TEST!

Za početak, pokrenite:

```powershell
cd f:\cod\progi\progiProjekt
pytest backend/tests/selenium/test_cases/test_setup.py -v
```

Trebali bi vidjeti rezultate u ~30 sekundi! 🚀

Sretno testiranje! 🎯
