# 📋 TEST KORISNICI I PODACI

## 👥 Test Korisnici

### Obični korisnik

```
Email:    user@fer.ugnz.hr
Lozinka:  password123
Uloga:    Obični korisnik
Pristup:  Home, Discussions, Buildings
```

### Admin korisnik

```
Email:    admin@fer.ugnz.hr
Lozinka:  adminpass123
Uloga:    Administrator
Pristup:  Home, Discussions, Buildings, Admin Panel
```

---

## 🏢 Test Zgrade

Trebalo bi da baza sadrži neke test zgrade:

```
1. Zgrada A
   - Naziv: "Zgrada A"
   - Adresa: "Prva ulica 1"
   - Grad: Zagreb

2. Zgrada B
   - Naziv: "Zgrada B"
   - Adresa: "Druga ulica 2"
   - Grad: Zagreb

3. Zgrada C
   - Naziv: "Zgrada C"
   - Adresa: "Treća ulica 3"
   - Grad: Osijek
```

---

## 💬 Test Rasprave

Trebalo bi da baza sadrži neke test rasprave:

```
1. Rasprava #1
   - Naslov: "Koji su najbolji načini za održavanje zgrade?"
   - Autor: user@fer.ugnz.hr
   - Datum: [prije nekoliko dana]
   - Status: Aktivna

2. Rasprava #2
   - Naslov: "Postoji li mogućnost za zajedničke događaje?"
   - Autor: user@fer.ugnz.hr
   - Datum: [prije nekoliko dana]
   - Status: Aktivna
```

---

## 🔐 Kako Kreirati Test Korisnike

### Opcija 1: Ručno kroz frontend (ako postoji registracija)

1. Otvorite aplikaciju
2. Kliknite "Registracija" ili "Sign Up"
3. Unesite:
   - Email: `user@fer.ugnz.hr`
   - Lozinka: `password123`
   - Potvrda lozinke: `password123`
4. Kliknite "Registracija"

Ponavljate za admin korisnika.

### Opcija 2: Direktno u bazi (ako imate pristup)

```sql
-- Ako koristite PostgreSQL/Supabase

-- Kreirajte obični korisnik
INSERT INTO public.users (email, password, role, created_at)
VALUES ('user@fer.ugnz.hr', 'hashed_password_123', 'user', NOW());

-- Kreirajte admin korisnika
INSERT INTO public.users (email, password, role, created_at)
VALUES ('admin@fer.ugnz.hr', 'hashed_admin_password', 'admin', NOW());
```

### Opcija 3: Seed Script (ako postoji)

```bash
# Ako imate seed script
npm run seed
# ili
node backend/scripts/seed.js
```

---

## 🧪 Test Scenariji - Redoslijed Izvršavanja

### Scenarij 1: Novi korisnik

```
1. Registracija novog korisnika
2. Prijava sa novim korisničkim računom
3. Pristup home stranici
4. Pregled rasprava
5. Pregled zgrada na mapi
6. Odjava
```

### Scenarij 2: Dodavanje nove rasprave

```
1. Prijaviti se kao user@fer.ugnz.hr
2. Ići na "Rasprave"
3. Klikniti "Nova rasprava"
4. Unijeti naslov: "Pitanje o zgradi"
5. Unijeti opis
6. Objaviti raspavu
7. Provjeriti da se pojavljuje na listi
```

### Scenarij 3: Dodavanje komentara

```
1. Prijaviti se
2. Ići na "Rasprave"
3. Klikniti na neku raspravu
4. Unijeti komentar
5. Objaviti komentar
6. Provjeriti da se pojavljuje
```

### Scenarij 4: Admin operacije

```
1. Prijaviti se kao admin@fer.ugnz.hr
2. Ići na "Admin Panel"
3. Pregledati korisnike
4. Pregledati zgrade
5. Pregledati rasprave
6. Obaviti neku akciju (npr. obrisati)
```

---

## 📊 Podaci za Test Rasprave

Ako trebate kreirati rasprave ručno:

### Rasprava 1
- **Naslov:** "Kako održavati zajedničke prostore?"
- **Opis:** "Trebam savjete kako najbolje održavati hodnik i zajedničke oblasti u zgradi."
- **Komentar:** "Trebalo bi organizirati redovite čišćenja."
- **Autor:** user@fer.ugnz.hr

### Rasprava 2
- **Naslov:** "Glasovanje za nova pravila u zgradi"
- **Opis:** "Trebamo glasovati o novim pravilima stanovanja."
- **Komentar:** "Trebalo bi da sve stanovnike bude uključeno."
- **Autor:** admin@fer.ugnz.hr

---

## ✅ Checklist - Podaci Prije Testiranja

Provjerite da su dostupni:

- [ ] Obični korisnik (user@fer.ugnz.hr)
- [ ] Admin korisnik (admin@fer.ugnz.hr)
- [ ] Barem 2-3 test rasprave
- [ ] Barem 2-3 test zgrade
- [ ] Barem 1 test komentar po rasprave

---

## 🔧 Kako Resetirati Test Podatke

Ako trebate resetirati sve test podatke:

### Opcija 1: Obriši i regeneriraj

```bash
# Ako koristite Supabase
supabase db reset

# Ili ako imate script
npm run db:reset
npm run db:seed
```

### Opcija 2: Ručno u bazi

```sql
-- Obriši sve podatke
DELETE FROM public.comments;
DELETE FROM public.discussion_votes;
DELETE FROM public.discussions;
DELETE FROM public.buildings;
DELETE FROM public.users;

-- Kreiraj nove
INSERT INTO public.users ... (vidjeti iznad)
```

---

## 📝 Test Email Adrese

Za testiranje email validacije:

```
Validne email adrese:
✅ user@fer.ugnz.hr
✅ admin@fer.ugnz.hr
✅ test.user@example.com
✅ test+tag@example.com

Nevalidne email adrese:
❌ notanemail
❌ @example.com
❌ user@
❌ user name@example.com
```

---

## 🔐 Test Lozinke

Trebale bi biti:
- Minimalno 8 karaktera
- Sadrže velika slova
- Sadrže male slove
- Sadrže brojeve

```
Validne:
✅ Password123
✅ TestPass1
✅ AdminPass2024

Nevalidne:
❌ pass        (premalo znakova)
❌ password    (nema broja)
❌ PASSWORD1   (samo velika slova)
```

---

## 💾 Kako Exportati Test Podatke

Ako trebate backup test podataka:

```bash
# SQL dump
pg_dump -U postgres progistanblog > backup.sql

# JSON export
supabase db pull
```

---

**Test Korisnici i Podaci**  
**Verzija:** 1.0  
**Datum:** 21.01.2026  
**Status:** ✅ Spreman za korištenje
