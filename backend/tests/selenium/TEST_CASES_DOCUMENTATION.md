# 📋 Detaljni Testni Slučajevi - Progistanblog Aplikacija

## TESTNI SLUČAJ 1: Uspješna prijava sa validnim kredencijalima

**TEST ID:** `TS_LOGIN_001`  
**NAZIV:** Uspješna prijava korisnika  
**PRIORITET:** ⚠️ KRITIČAN  
**KATEGORIJA:** Login / Autentifikacija  
**VERZIJA:** 1.0  

### PREDUVJETI
- Aplikacija je dostupna na `http://localhost:5173`
- Baza podataka sadrži test korisnika: `user@fer.ugnz.hr` / `password123`
- Browser je pokrenut (Chrome, Firefox ili Safari)
- Korisnik nije već prijavljen

### ULAZI
```
Email: user@fer.ugnz.hr
Lozinka: password123
URL aplikacije: http://localhost:5173
```

### KORACI TESTIRANJA (detaljan redoslijed izvršavanja)

| # | Akcija | Očekivani rezultat | Napomena |
|---|--------|-------------------|---------|
| 1 | Otvoriti aplikaciju u pregledniku | Login forma je vidljiva | Mora biti vidljiv email input, password input i "Prijava" gumb |
| 2 | Kliknuti na polje "Email" | Polje je fokusirano (cursor je vidljiv) | Polje bi trebalo biti označeno |
| 3 | Unijeti "user@fer.ugnz.hr" | Tekst je unesen ispravno | Provjeriti da je text vidljiv |
| 4 | Kliknuti na polje "Lozinka" | Polje je fokusirano | Polje bi trebalo biti označeno |
| 5 | Unijeti "password123" | Tekst je unesen (prikazan kao *) | Nikada ne prikazivati lozinku u plaintext-u |
| 6 | Kliknuti na gumb "Prijava" | Stranica počinje učitavati (mogući loading spinner) | Loading indikator bi trebao biti vidljiv |
| 7 | Čekati do 10 sekundi za učitavanje | Stranica se učitava bez greške | Ako učitavanje traje duže, test pada |
| 8 | Provjeriti URL aplikacije | URL se promijenio sa `/login` na `/` ili `/home` | URL ne bi trebao sadržavati "login" |
| 9 | Provjeriti da je korisničko ime vidljivo | Korisničko ime se prikazuje (npr. u topbar-u) | Trebalo bi vidjeti logiranu sesiju |
| 10 | Provjeriti da login forma nije dostupna | Login forma se više ne prikazuje | Zamijenjena je sa home stranom |

### OČEKIVANI IZLAZ (što trebalo biti)
```
✅ Korisnik je uspješno prijavljen
✅ URL se promijenio sa /login na /
✅ Početna stranica je učitana
✅ Korisničko ime je vidljivo u navigaciji
✅ Sesija je aktivna (cookie je postavljena)
✅ Vrijeme učitavanja: < 5 sekundi
```

### DOBIVENI IZLAZ (što pokazuje test)
```
Screenshot #1: Login forma pri pokretanju testa
Screenshot #2: Forma nakon unosa podataka
Screenshot #3: Početna stranica nakon uspješne prijave

Console logove (ako su dostupne):
- Nema grešaka u console-u
- API zahtjev je odgovorio sa statusom 200

Browser logove:
- Nema 404 ili 500 grešaka
```

### DATOTEKE ZA PRILOG
```
📸 TC_LOGIN_001_start.png       - Login forma pri pokretanju
📸 TC_LOGIN_001_success.png     - Početna stranica nakon logina
📄 test_logs.txt                - Console logovi iz testa
📊 network_requests.json        - API zahtjevi i odgovori
```

### STATUS
- [ ] PASS ✅
- [ ] FAIL ❌
- [ ] BLOCKED 🚫

### IZVRŠAVANJE
**Datum izvršavanja:** 21.01.2026  
**Vrijeme izvršavanja:** ~3.5 sekunde  
**Izvršio/izvršila:** QA tester  
**Browser:** Chrome 120  
**OS:** Windows 10  

### NAPOMENE
Prijavljivanje je ključno za cijelu aplikaciju. Ako ovaj test pada, ostali testovi neće moći biti izvršeni.

---

## TESTNI SLUČAJ 2: Nevaljana lozinka (Rubni uvjet)

**TEST ID:** `TS_LOGIN_002`  
**NAZIV:** Pokušaj prijave sa pogrešnom lozinkom  
**PRIORITET:** ⚠️ KRITIČAN  
**KATEGORIJA:** Login / Autentifikacija / Rubni uvjet  
**VERZIJA:** 1.0  

### PREDUVJETI
- Aplikacija je dostupna
- Test korisnik postoji u bazi
- Korisnik nije prijavljen

### ULAZI
```
Email: user@fer.ugnz.hr
Lozinka: malimedo           (POGREŠNA)
```

### KORACI TESTIRANJA

| # | Akcija | Očekivani rezultat |
|---|--------|-------------------|
| 1 | Otvoriti login stranicu | Login forma je vidljiva |
| 2 | Unijeti email "user@fer.ugnz.hr" | Email je unesen |
| 3 | Unijeti lozinku "malimedo" | Lozinka je unesen (vidljiva kao *) |
| 4 | Kliknuti "Prijava" | Server obrađuje zahtjev |
| 5 | Čekati odgovore servera | Poruka o grešci se prikazuje |
| 6 | Provjeriti poruku o grešci | Poruka je vidljiva (npr. "Pogrešno korisničko ime ili lozinka") |
| 7 | Provjeriti URL | Korisnik ostaje na `/login` stranici |
| 8 | Provjeriti email polje | Email polje ostaje popunjeno |
| 9 | Provjeriti lozinku polje | Lozinka polje je prazno (iz sigurnosti) |

### OČEKIVANI IZLAZ
```
❌ Prijava nije uspješna
✅ Poruka o grešci je vidljiva: "Pogrešno korisničko ime ili lozinka"
✅ Korisnik ostaje na /login stranici
✅ HTTP status odgovora: 401 Unauthorized
```

### DOBIVENI IZLAZ
```
Screenshot: error_message.png - Prikazuje grešku
API odgovori:
  - POST /api/auth/login
  - Status: 401
  - Odgovor: {"error": "Invalid credentials"}
```

### STATUS
- [ ] PASS ✅
- [ ] FAIL ❌

### NAPOMENE
Ovo je sigurnostni test - trebao bi spriječiti brute-force napade. Trebam provjeriti postoji li rate limiting.

---

## TESTNI SLUČAJ 3: Prazan email (Rubni uvjet)

**TEST ID:** `TS_LOGIN_003`  
**NAZIV:** Pokušaj prijave bez email-a  
**PRIORITET:** 🔵 VISOKI  
**KATEGORIJA:** Login / Validacija / Rubni uvjet  

### ULAZI
```
Email: [PRAZNO]
Lozinka: password123
```

### KORACI
1. Otvoriti login formu
2. Ostaviti email polje prazno
3. Unijeti lozinku
4. Kliknuti "Prijava"
5. Provjeriti validaciju

### OČEKIVANI IZLAZ
```
✅ Validacijska poruka se prikazuje: "Email je obavezan"
✅ Zahtjev NIJE poslan na server (client-side validacija)
✅ Korisnik ostaje na login stranici
✅ Lozinka polje postaje prazno (sigurnost)
```

### STATUS
- [ ] PASS ✅
- [ ] FAIL ❌

---

## TESTNI SLUČAJ 4: Admin pristup - dostupan

**TEST ID:** `TS_ADMIN_001`  
**NAZIV:** Admin korisnik može pristupiti admin panelu  
**PRIORITET:** ⚠️ KRITIČAN  
**KATEGORIJA:** Admin / Autorizacija  

### ULAZI
```
Email: admin@fer.ugnz.hr
Lozinka: adminpass123
```

### KORACI
1. Prijaviti se kao admin
2. Navigirati na `/admin` stranicu
3. Provjeriti da je admin panel dostupan
4. Provjeriti da su dostupne admin mogućnosti:
   - [ ] Upravljanje korisnicima
   - [ ] Upravljanje zgradama
   - [ ] Upravljanje raspravama

### OČEKIVANI IZLAZ
```
✅ Admin stranica je dostupna
✅ Prikazane su sve admin mogućnosti
✅ HTTP status: 200 OK
✅ Korisnik ima sve admin permissije
```

### DOBIVENI IZLAZ
```
Screenshots:
- admin_panel_main.png
- admin_users_section.png
- admin_buildings_section.png
```

### STATUS
- [ ] PASS ✅
- [ ] FAIL ❌

---

## TESTNI SLUČAJ 5: Obični korisnik NE može pristupiti admin panelu

**TEST ID:** `TS_ADMIN_002`  
**NAZIV:** Obični korisnik nema pristupa admin panelu  
**PRIORITET:** ⚠️ KRITIČAN  
**KATEGORIJA:** Admin / Sigurnost / Autorizacija  

### ULAZI
```
Email: user@fer.ugnz.hr
Lozinka: password123
```

### KORACI
1. Prijaviti se kao obični korisnik
2. Pokušati pristupiti `/admin` URL-u
3. Provjeriti da je pristup odbijen

### OČEKIVANI IZLAZ
```
❌ Pristup je odbijen
✅ HTTP status: 403 Forbidden ili 401 Unauthorized
✅ Korisnik je redirectan na početnu stranicu ili prikazana je error poruka
✅ Stranica "Admin panel" se ne može vidjeti
```

### STATUS
- [ ] PASS ✅
- [ ] FAIL ❌

### KRITIČNOST
🔴 **SIGUNOST:** Ako obični korisnik MOŽE pristupiti admin panelu, postoji kritična sigurnosna grešku!

---

## TESTNI SLUČAJ 6: Kreiranje nove rasprave

**TEST ID:** `TS_DISC_001`  
**NAZIV:** Korisnik može kreirati novu raspravu  
**PRIORITET:** 🔵 VISOKI  
**KATEGORIJA:** Rasprave / Funkcionalnost  

### ULAZI
```
Korisnik: prijavljen kao user@fer.ugnz.hr
Naslov rasprave: "Važna pitanja o zgradama"
Tekst rasprave: "Koja je najbolja lokacija za stanovanje?"
```

### KORACI
1. Prijaviti se
2. Otvoriti stranicu "Rasprave"
3. Kliknuti "Nova rasprava"
4. Unijeti naslov
5. Unijeti tekst
6. Kliknuti "Objavi"
7. Provjeriti da je rasprava dodana

### OČEKIVANI IZLAZ
```
✅ Nova rasprava je kreirana
✅ Rasprava se pojavljuje u listi rasprava
✅ Broj rasprava je povećan za 1
✅ Korisničko ime autora je prikazano
✅ Datum kreiranja je prikazan
```

### STATUS
- [ ] PASS ✅
- [ ] FAIL ❌

---

## SAŽETAK SVIH TESTNIH SLUČAJEVA

### Login testovi
- ✅ TC_LOGIN_001: Uspješna prijava
- ✅ TC_LOGIN_002: Nevaljana lozinka
- ✅ TC_LOGIN_003: Prazan email
- ✅ TC_LOGIN_004: Prazna lozinka
- ✅ TC_LOGIN_005: Nepostojeći korisnik
- ✅ TC_LOGIN_006: Neispravan format email-a

### Admin testovi
- ✅ TC_ADMIN_001: Admin pristup
- ✅ TC_ADMIN_002: Obični korisnik nema pristupa
- ✅ TC_ADMIN_003: Admin - sekcija korisnika
- ✅ TC_ADMIN_004: Admin - sekcija zgrada

### Rasprave testovi
- ✅ TC_DISC_001: Pregled rasprava
- ✅ TC_DISC_002: Kreiranje rasprave
- ✅ TC_DISC_003: Pregled detalja rasprave
- ✅ TC_DISC_004: Dodavanje komentara

**Ukupno testnih slučajeva:** 14  
**Kritičnih testova:** 5  
**Visokih prioriteta:** 4  
**Srednji prioriteti:** 5  

---

## PRIJEDLOZI ZA TESTIRANJE

1. **Dodatni testovi koji trebali:**
   - Test za "Zaboravljena lozinka" funkcionalnost
   - Test za Google OAuth prijavu
   - Test za odjavu (logout)
   - Test za promjenu profila korisnika
   - Test za glasovanje na raspravama
   - Test za performansu kod spore veze
   - Test za logout nakon neaktivnosti

2. **Performance testovi:**
   - Vrijeme učitavanja aplikacije
   - Vrijeme odgovora API-ja
   - Vrijeme učitavanja liste rasprava sa 100+ stavki

3. **Security testovi:**
   - SQL injection u login formu
   - XSS (Cross-site scripting) u komentarima
   - CSRF (Cross-site request forgery) zaštita
   - Rate limiting na API endpointima

---

## NAČIN IZVJEŠTAVANJA

Za svaki test trebate:
1. ✅ Dokumentirati sve korake detaljno
2. 📸 Priložiti screenshot-ove (početak, sredina, kraj)
3. 📝 Snimiti logove (console, network, server)
4. 📊 Priložiti vrijeme izvršavanja
5. 🐛 Dokumentirati sve otkrivene greške
6. 🔍 Opisati ponašanje posebno u rubnim uvjetima

---

**Dokument: Testni slučajevi - Progistanblog**  
**Verzija:** 1.0  
**Autor:** QA Team  
**Datum:** 21.01.2026  
**Status:** ✅ Spreman za testiranje
