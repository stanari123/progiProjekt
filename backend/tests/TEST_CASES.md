# Test Cases - Component Tests

This document describes component-level test cases located in `backend/tests/`.

## Overview
- Total test cases: 7
- Test runner: Jest (see `package.json` scripts)

## Test cases

1. **AUTH-TC-001 — Valid user login (Regular Case)**
   - Functionality: password hashing and comparison for login flow
   - Input: plain password `password123` (hashed internally)
   - Expected: `bcrypt.compare` returns `true`
   - Obtained: PASS
   - Procedure: `npm run test:backend` runs `backend/tests/authService.test.js`

2. **AUTH-TC-002 — Invalid password handling (Exception Case)**
   - Functionality: error construction/handling when credentials invalid
   - Input: construct `new AppError('Neispravni podaci', 401)`
   - Expected: instance of `AppError` with status `401`
   - Obtained: PASS
   - Procedure: see `authService.test.js`

3. **POLL-TC-001 — Valid poll creation (Regular Case)**
   - Functionality: validation that poll question is non-empty
   - Input: question string `'Što mislite o novom izgledu?'`
   - Expected: validation passes (truthy)
   - Obtained: PASS
   - Procedure: see `pollService.test.js`

4. **POLL-TC-002 — Empty question validation (Edge Case)**
   - Functionality: reject empty poll question
   - Input: empty string `''`
   - Expected: `AppError` thrown with message `Pitanje je obavezno` (400)
   - Obtained: PASS
   - Procedure: see `pollService.test.js`

5. **DISC-TC-003 — Owner access to private discussion (Regular Case)**
   - Functionality: owner access control for private discussions
   - Input: discussion object with `owner_id === 'user-456'` and `userId = 'user-456'`
   - Expected: access allowed (`true`)
   - Obtained: PASS
   - Procedure: see `discussionsService.test.js`

6. **DISC-TC-004 — Discussion not found (Exception Case)**
   - Functionality: throwing `AppError` when discussion lookup returns no data
   - Input: `data = null`
   - Expected: `AppError` thrown with message `Diskusija nije pronađena` (404)
   - Obtained: PASS
   - Procedure: see `discussionsService.test.js`

7. **NON-TC-005 — Non-existent functionality (Missing Function) (Negative Case)**
   - Functionality: reaction when calling an unimplemented / non-exported function
   - Input: call `discussionsService.nonExistentFunction()`
   - Expected: `TypeError` is thrown (attempting to call `undefined`)
   - Obtained: PASS
   - Procedure: see `nonexistentFunction.test.js`

## How to run

From project root (`progiProjekt`):

```powershell
Set-Location 'f:\cod\progi\progiProjekt'
npm run test:backend
```

This runs Jest on `backend/tests/` and prints pass/fail results.

## Notes
- Current tests cover Regular cases, Edge cases, Exception throwing, and Non-existent functionality.
- All tests present in `backend/tests/` pass on this environment (7 passed).
