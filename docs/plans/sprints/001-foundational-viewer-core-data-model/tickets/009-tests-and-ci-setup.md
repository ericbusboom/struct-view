---
id: "009"
title: Tests and CI setup
status: todo
use-cases: [SUC-001, SUC-002, SUC-003]
depends-on: ["002", "005", "007", "008"]
---

# Tests and CI setup

## Description

Set up the test infrastructure and CI pipeline. Ensure all tests from previous tickets run in CI. Add integration tests that verify the full workflow: create a model, edit it, save it, reload it, and confirm integrity. Configure GitHub Actions (or equivalent) to run tests on every push.

## Implementation Notes

- Frontend testing: Vitest (or Jest) for unit tests, React Testing Library for component tests
- Backend testing: pytest for API and validation tests
- Integration test: programmatic workflow that creates nodes/members, exports JSON, re-imports, validates round-trip
- CI pipeline (GitHub Actions):
  - Install Node dependencies, run `npm test`, run `npm run build`
  - Install Python dependencies, run `pytest`
  - Fail the build if any test fails
- Linting: ESLint for TypeScript, ruff or flake8 for Python (optional but recommended)

## Acceptance Criteria

- [ ] `npm test` runs all frontend unit and component tests
- [ ] `pytest` runs all backend tests
- [ ] CI pipeline runs on push and PR, reports pass/fail
- [ ] Integration test covers: create model -> edit -> export -> import -> validate
- [ ] All existing tests from tickets 002-008 pass in CI
- [ ] Build artifacts are clean (no TypeScript errors, no Python lint failures)

## Testing

- **Existing tests to run**: All tests from tickets 002-008
- **New tests to write**: Integration round-trip test
- **Verification command**: `npm test && cd backend && python -m pytest`
