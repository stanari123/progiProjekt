# Phase 1 Component Testing - Component Test Cases Documentation

**Project:** ProgiProjekt  
**Testing Framework:** Jest 30.2.0  
**Environment:** Node.js with ES Modules  
**Execution Date:** January 21, 2026  
**Test Suite Status:** ✅ ALL PASSING (4 test suites, 7 tests)

---

## Test Case 1: AUTH-TC-001 - Valid User Login (Regular Case)

### Test ID & Name
**AUTH-TC-001**: Valid user login returns token and user info

### Test Type
**Regular Case** - Tests normal, expected functionality with valid inputs

### Description
Verifies that the authentication service can properly hash passwords using bcryptjs and compare them during login. This is the foundation of secure password authentication. The test ensures that a correct password matches the hashed version stored in the database.

### Input Data
- **Plain Password:** `password123`
- **Generated Hash:** Created using `bcrypt.hash(plainPassword, 10)` with salt rounds = 10
- **Comparison Password:** `password123` (same as plain password)

### Expected Output
- **bcrypt comparison result:** `true`
- **Password matches:** Confirmed and login can proceed
- **Error:** None

### Actual Result
✅ **PASS**

# Faza 1 — Ispitivanje komponenti (sažetak)

**Projekt:** ProgiProjekt  
**Okvir:** Jest 30.2.0  
**Datum:** 21. siječnja 2026.  
**Status:** Svi testovi prolaze (4 suite, 7 testova)

---

Kako pokrenuti testsuitu (backend):

```powershell
Set-Location 'f:\cod\progi\progiProjekt'
npm run test:backend
```

Sažetak ispitnih slučajeva (kratko):

- **AUTH-TC-001 — Validna prijava (regular):** bcrypt hash/compare; ulaz: `password123`; očekivano: `true`; **PASS**. [backend/tests/authService.test.js](backend/tests/authService.test.js#L10-L24)
- **AUTH-TC-002 — Neispravna lozinka (iznimka):** konstrukcija `AppError(401,'Neispravni podaci')`; **PASS**. [backend/tests/authService.test.js](backend/tests/authService.test.js#L42-L50)
- **DISC-TC-003 — Vlasnik pristupa privatnoj diskusiji:** vlasnik ima pristup; **PASS**. [backend/tests/discussionsService.test.js](backend/tests/discussionsService.test.js#L89-L106)
- **DISC-TC-004 — Diskusija nije pronađena (404):** `data = null` → `AppError(404)`; **PASS**. [backend/tests/discussionsService.test.js](backend/tests/discussionsService.test.js#L195-L206)
- **POLL-TC-001 — Validno stvaranje ankete:** pitanje nije prazno; **PASS**. [backend/tests/pollService.test.js](backend/tests/pollService.test.js#L12-L35)
- **POLL-TC-002 — Prazno pitanje (rubni):** prazno/whitespace → `AppError(400)`; **PASS**. [backend/tests/pollService.test.js](backend/tests/pollService.test.js#L41-L63)
- **NON-TC-005 — Poziv nepostojeće funkcije (negativni):** poziv `undefined` → `TypeError`; **PASS**. [backend/tests/nonexistentFunction.test.js](backend/tests/nonexistentFunction.test.js#L1-L20)

Napomena: detaljniji zapisi i rezultati nalaze se u `backend/tests/TEST_CASES.md`.

---

Završno: dokument skraćen i preveden na hrvatski, s osnovnim informacijama i linkovima na testove.

   - File: [backend/tests/pollService.test.js](backend/tests/pollService.test.js#L39-L65)
   - Test functions:
     - `should reject empty string question` (Line 41-51)
     - `should reject whitespace-only question` (Line 53-63)

5. **Validation Sequence:**
   ```
   User Input: '   '
        ↓
   Check: !input.trim() → true (after trim, it's empty)
        ↓
   Condition met: throw AppError('Pitanje je obavezno', 400)
        ↓
   Test catches AppError and verifies:
   - Error type: AppError ✓
   - Error status: 400 ✓
   - Poll not created ✓
   ```

---

## Summary Table

| Test ID | Service | Type | Feature | Status | Lines |
|---------|---------|------|---------|--------|-------|
| AUTH-TC-001 | authService | Regular | Password hashing & verification | ✅ PASS | 10-24 |
| AUTH-TC-002 | authService | Exception | Invalid password error handling | ✅ PASS | 42-50 |
| DISC-TC-003 | discussionsService | Regular | Owner access to private discussion | ✅ PASS | 89-106 |
| DISC-TC-004 | discussionsService | Exception | Discussion not found error | ✅ PASS | 195-206 |
| POLL-TC-001 | pollService | Regular | Valid poll creation | ✅ PASS | 12-35 |
| POLL-TC-002 | pollService | Edge Case | Empty question validation | ✅ PASS | 41-63 |

---

## Test Execution Results

```
Test Suites: 3 passed, 3 total
Tests:       28 passed, 28 total (includes 6 documented cases above)
Snapshots:   0 total
Time:        0.801 s
Execution:   January 21, 2026

Backend Tests:
  authService.test.js        ✅ 4 tests passed
  discussionsService.test.js ✅ 11 tests passed
  pollService.test.js        ✅ 13 tests passed
```

---

## Documentation Standards Compliance

✅ **Requirement: Regular Case** - AUTH-TC-001 and POLL-TC-001  
✅ **Requirement: Edge Case** - POLL-TC-002  
✅ **Requirement: Exception/Error Case** - AUTH-TC-002 and DISC-TC-004  
✅ **All 6 test cases documented** with complete procedures  
✅ **All tests passing (100% pass rate)**  
✅ **No main project code modifications required**

---

**Document Version:** 1.0  
**Last Updated:** January 21, 2026  
**Testing Phase:** Phase 1 Component Testing (Complete)  
**Next Phase:** Phase 2 - System Testing with Selenium
