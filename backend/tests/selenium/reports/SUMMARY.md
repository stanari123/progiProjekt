# Selenium Test Run — Summary

- **Date:** Automated run (see HTML report for exact timestamps)
- **Duration:** 218.55s
- **Result:** **13 passed**, **5 failed**, **1 warning**

## Artifacts
- **HTML report:** [backend/tests/selenium/reports/report.html](backend/tests/selenium/reports/report.html)
- **Screenshots:** [backend/tests/selenium/reports/screenshots/](backend/tests/selenium/reports/screenshots/)
- **Pytest log:** [backend/tests/selenium/reports/logs/pytest.log](backend/tests/selenium/reports/logs/pytest.log)

## Failed tests (quick diagnostics)
- `backend/tests/selenium/test_cases/test_admin.py::TestAdmin::test_TC_ADMIN_001_admin_access` — Admin page not available (likely missing admin user or permissions).
- `backend/tests/selenium/test_cases/test_admin.py::TestAdmin::test_TC_ADMIN_003_admin_users_section` — Admin page unavailable.
- `backend/tests/selenium/test_cases/test_admin.py::TestAdmin::test_TC_ADMIN_004_admin_buildings_section` — Admin page unavailable.
- `backend/tests/selenium/test_cases/test_login.py::TestLogin::test_TC_LOGIN_001_valid_credentials` — Unexpected error when logging in (likely missing seeded test user or auth backend not configured).
- `backend/tests/selenium/test_cases/test_nonexistent_functionality.py::TestNonexistentFunctionality::test_TC_NONEXIST_001_nonexistent_route` — App returned SPA root instead of a 404/friendly error page (the front-end serves index.html for unknown routes).

## Notes & Next Steps
- The HTML report was generated at the path above — open it for full tracebacks and screenshots.
- To fix remaining failures: seed the expected test users (regular + admin) or adjust tests to use available accounts; optionally update the app to return a 404 for unknown routes if a friendly error is required.
- I can re-run the suite (or re-run only failing tests) after you provide test credentials or confirm seeding; would you like me to do that now?
