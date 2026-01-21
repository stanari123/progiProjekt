# 📚 Selenium Testovi - Kompletan Pregled

Dobrodošli u Selenium testiranje za Progistanblog aplikaciju!

---

## 🎯 Što Trebate Znati

Ova direktorija sadrži sve što trebate za testiranje Progistanblog aplikacije sa Selenium testima.

**Cilj:** Osigurati da se aplikacija ponaša kako treba u različitim scenarijima.

**Što je pokriveno:**
- ✅ Login funkcionalnost (6 testova)
- ✅ Admin panel (4 testa)
- ✅ Rasprave/Diskusije (4 testa)
- ✅ Osnovna funkcionalnost (3 testa)

**Ukupno:** 17 testnih slučajeva

---

## 📖 Gdje Početi?

### Za Brzi Start (5 minuta)

👉 **Čitajte:** [QUICK_START.md](./QUICK_START.md)

Sadrži:
- 3 koraka za instalaciju
- Kako pokrenuti prvi test
- Gdje vidjeti rezultate

### Za Detaljne Upute (15 minuta)

👉 **Čitajte:** [HOW_TO_RUN.md](./HOW_TO_RUN.md)

Sadrži:
- Detaljne naredbe za svaki korak
- Primjere izvršavanja
- Troubleshooting savjete

### Za Detalje Testnih Slučajeva (30 minuta)

👉 **Čitajte:** [TEST_CASES_DOCUMENTATION.md](./TEST_CASES_DOCUMENTATION.md)

Sadrži:
- Specifikacije svakog testa
- Ulaze i očekivane rezultate
- Detaljne korake za reproduciranje

### Za Test Podatke

👉 **Čitajte:** [TEST_DATA.md](./TEST_DATA.md)

Sadrži:
- Test korisnike i lozinke
- Test zgrade i rasprave
- Kako kreirati test podatke

### Za Primjer Report-a

👉 **Čitajte:** [SAMPLE_TEST_REPORT.md](./SAMPLE_TEST_REPORT.md)

Sadrži:
- Primjer završnog report-a
- Kako dokumentirati greške
- Kako napraviti preporuke

### Za Detaljnu Dokumentaciju

👉 **Čitajte:** [README.md](./README.md)

Sadrži:
- Kompletan pregled strukture
- Sve mogućnosti testiranja
- Napredne opcije

---

## 📁 Struktura Direktorija

```
backend/tests/selenium/
├── 📄 README.md                          ← Početna dokumentacija
├── 📄 QUICK_START.md                     ← Brzi start (5 min)
├── 📄 HOW_TO_RUN.md                      ← Detaljne naredbe
├── 📄 TEST_CASES_DOCUMENTATION.md        ← Detalji testova
├── 📄 TEST_DATA.md                       ← Test podaci
├── 📄 SAMPLE_TEST_REPORT.md              ← Primjer report-a
├── 📄 INDEX.md                           ← Ovaj file (overview)
├── 📄 conftest.py                        ← Pytest konfiguracija
├── 📄 pytest.ini                         ← Pytest settings
│
├── 📁 config/
│   └── conftest.py                       ← (legacy - vidi root conftest.py)
│
├── 📁 page_objects/                      ← Objekt-iji za test stranice
│   ├── __init__.py
│   ├── base_page.py                      ← Bazna klasa
│   ├── login_page.py                     ← Login stranica
│   ├── home_page.py                      ← Početna stranica
│   └── admin_page.py                     ← Admin stranica
│
├── 📁 utilities/                         ← Pomoćne funkcije
│   ├── __init__.py
│   ├── wait_helpers.py                   ← Čekanje na elemente
│   └── screenshot_logger.py              ← Snimanje screenshot-a
│
├── 📁 test_cases/                        ← Glavni testovi
│   ├── __init__.py
│   ├── test_setup.py                     ← Osnovni testovi (3)
│   ├── test_login.py                     ← Login testovi (6)
│   ├── test_admin.py                     ← Admin testovi (4)
│   └── test_discussions.py               ← Rasprave testovi (4)
│
└── 📁 reports/                           ← Rezultati testiranja
    ├── report.html                       ← HTML izvještaj (nakon testa)
    ├── 📁 logs/
    │   └── pytest.log                    ← Detaljni logovi
    ├── 📁 screenshots/
    │   └── YYYYMMDD_HHMMSS/              ← Screenshot-ovi testova
    │       ├── TC_LOGIN_001_start.png
    │       ├── TC_LOGIN_001_success.png
    │       └── ... (više screenshot-a)
    └── 📁 junit_reports/                 ← JUnit XML izvještaji
```

---

## 🚀 Brzina - Korak po Korak

### Ako ste prvi put:

```
1. Instalirajte Python pakete
   → Trebati će 2 minuite
   
2. Pokrenite aplikaciju
   → Trebati će 30 sekundi
   
3. Pokrenite testove
   → Trebati će ~3-5 minuta
   
4. Pregledajte rezultate
   → Trebati će 5 minuta

UKUPNO: ~15 minuta za prvi run
```

### Ako trebate opetovati:

```
1. Testovi se opet pokrenite
   → Trebati će ~3-5 minuta
   
2. Pogledajte rezultate
   → Trebati će 2 minuta

UKUPNO: ~7 minuta
```

---

## 📊 Što Testovi Pokrivaju

### 1. Login Testovi (6 testova)

```
✅ TS_LOGIN_001 - Uspješna prijava
✅ TS_LOGIN_002 - Nevaljana lozinka
✅ TS_LOGIN_003 - Prazan email
✅ TS_LOGIN_004 - Prazna lozinka
✅ TS_LOGIN_005 - Nepostojeći korisnik
✅ TS_LOGIN_006 - Neispravan format email-a
```

### 2. Admin Testovi (4 testa)

```
✅ TS_ADMIN_001 - Admin pristup dostupan
✅ TS_ADMIN_002 - Obični korisnik NE može pristupiti
✅ TS_ADMIN_003 - Admin sekcija korisnika
✅ TS_ADMIN_004 - Admin sekcija zgrada
```

### 3. Rasprave Testovi (4 testa)

```
✅ TS_DISC_001 - Pregled rasprava
✅ TS_DISC_002 - Kreiranje nove rasprave
✅ TS_DISC_003 - Pregled detalja rasprave
✅ TS_DISC_004 - Dodavanje komentara
```

### 4. Osnovni Testovi (3 testa)

```
✅ test_browser_opens - Browser se otvara
✅ test_app_loads - Aplikacija se učitava
✅ test_login_page_visible - Login forma je vidljiva
```

---

## ✨ Značajke Testova

### Page Object Pattern
- Čitljiv kod
- Laganija maintenance
- Ponovna upotreba koda

```python
# Primjer
login_page = LoginPage(driver)
login_page.open()
login_page.login("user@fer.ugnz.hr", "password123")
home_page.wait_for_home_page()
```

### Screenshot-ovi
- Automatski se snimaju za svaki test
- Spravljaju se sa opisima što se desilo
- Dostupni su u `/reports/screenshots/`

### HTML Report
- Lijepi grafički prikaz
- Prikazuje PASS/FAIL status
- Vrijeme izvršavanja
- Linkovi na screenshot-e

### Logovi
- Detaljni logovi svakog testa
- Debug informacije
- Dostupni u `/reports/logs/`

---

## 🎓 Kako Razumjeti Rezultate

### OK - Sve je prošlo 🎉

```
14 passed in 2.45s

✅ Svi testovi su prošli
✅ Aplikacija je sprema za produkciju
```

### Upozorenje - Neki testovi su Warning ⚠️

```
12 passed, 1 warning in 2.30s

⚠️ Neki element nije pronađen
⚠️ Aplikacija je spora
✅ Ali testovi nisu padali

👉 Trebate provjeriti što je problem
```

### Greška - Testovi su padali 🔴

```
10 passed, 2 failed in 2.50s

❌ Neki test je pao
❌ Greška je kritična

👉 Trebate ispraviti bug prije go-live
```

---

## 🔧 Česte Naredbe

### Pokrenite sve testove

```bash
pytest backend/tests/selenium/test_cases/ -v --html=backend/tests/selenium/reports/report.html
```

### Pokrenite samo login testove

```bash
pytest backend/tests/selenium/test_cases/test_login.py -v
```

### Pokrenite specifičan test

```bash
pytest backend/tests/selenium/test_cases/test_login.py::TestLogin::test_TC_LOGIN_001_valid_credentials -v
```

### Pokrenite sa detaljnim logovima

```bash
pytest backend/tests/selenium/test_cases/ -v --log-cli-level=DEBUG
```

### Pokrenite samo kritične testove

```bash
pytest backend/tests/selenium/test_cases/ -m critical -v
```

---

## 📝 Kako Dokumentirati Greške

Ako test pada, trebate:

1. **Snimite screenshot**
   ```
   Već se automatski snima!
   📸 /reports/screenshots/YYYYMMDD_HHMMSS/TC_ERROR.png
   ```

2. **Snimite logove**
   ```
   Već se automatski snima!
   📄 /reports/logs/pytest.log
   ```

3. **Dokumentirajte grešku**
   ```markdown
   ### Greška #1: Login ne radi
   - Test: TS_LOGIN_001
   - Prioritet: KRITIČAN
   - Što se dogodilo: Login forme je prazna
   - Očekivano: Trebala bi biti vidljiva
   - Screenshot: TC_LOGIN_001_error.png
   - Mogući uzrok: Backend nije dostupan
   ```

---

## 🆘 Trebate Pomoć?

### Brzo rješenje

```bash
# Pokrenite prvi test
pytest backend/tests/selenium/test_cases/test_setup.py::test_app_loads -v

# Trebalo bi biti prošlo
# Ako je palo, provjerite:
1. Je li aplikacija pokrenuta na http://localhost:5173?
2. Je li Python instaliran?
3. Jesu li paketi instalirani (pip install ...)?
```

### Čitajte dokumentaciju

1. [QUICK_START.md](./QUICK_START.md) - Brzo rješenje
2. [HOW_TO_RUN.md](./HOW_TO_RUN.md) - Detaljne naredbe
3. [README.md](./README.md) - Kompletan pregled

### Kontaktirajte

- 👨‍💻 Development tim
- 🧪 QA tim
- 📧 Email: [contact]

---

## ✅ Checklist - Prije Nego što Počnete

- [ ] Python 3.8+ instaliran
- [ ] Paketi instalirani (`pip install selenium pytest ...`)
- [ ] Aplikacija je pokrenuta na `http://localhost:5173`
- [ ] Backend je pokrenutan (ako trebate)
- [ ] Test korisnici postoje (`user@fer.ugnz.hr`, `admin@fer.ugnz.hr`)
- [ ] Internet konekcija je dostupna

---

## 📚 Dodatni Resursi

- **Selenium dokumentacija:** https://www.selenium.dev/documentation/
- **Pytest dokumentacija:** https://docs.pytest.org/
- **Page Object Pattern:** https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
- **WebDriver dokumentacija:** https://www.selenium.dev/documentation/webdriver/

---

## 🎉 Gotov? Pokrenite Testove!

```bash
cd f:\cod\progi\progiProjekt
pytest backend/tests/selenium/test_cases/test_setup.py -v
```

Trebalo bi biti gotovo za ~1 minutu! 🚀

---

**Selenium Testovi - Progistanblog**  
**Verzija:** 1.0  
**Status:** ✅ Spreman za korištenje  
**Datum:** 21.01.2026
