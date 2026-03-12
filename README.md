# PokerSiteProject

Full-stack poker/casino platform with React frontend and Node/Express backend.

## Run Locally

### 1) Install
```bash
npm install --force
```

### 2) Start frontend + backend
```bash
npm start
```

### 3) Build
```bash
npm run build
```

## Technical Issues Assessment (Summary)

This repository includes a technical assessment and remediation pass that identified and addressed **16 issues** across backend and frontend.

### Main issue categories
- Validation and runtime safety failures.
- Missing authorization checks on sensitive mutation endpoints.
- Data integrity problems (duplicate joins, malformed ORM queries).
- WebSocket stability and room-scoping issues.
- Critical security risk from dynamic code execution.
- Frontend/API integration mismatches (paths, token handling, route/command inconsistencies).

### Highlights of fixes
- Fixed `express-validator` usage (`isEmpty()` call pattern).
- Added/strengthened owner/admin authorization in game/tournament operations.
- Protected account amount endpoint with auth middleware.
- Enforced server-side identity for tournament joins and blocked duplicates.
- Fixed malformed Sequelize `findOne` patterns (`where` clauses).
- Hardened WebSocket payload parsing and edge-case handling.
- Removed dynamic execution pattern (`Function.constructor`) and replaced with safe logging.
- Aligned frontend account/token endpoints and route behavior.
- Stabilized tests with controlled axios mocking and updated test baseline.

## Validation Results

- `npm test`: pass.
- `npm run build`: success (with non-blocking lint warnings).
- `node --check` on updated backend files: no syntax errors.
- Runtime endpoint checks captured in evidence under `docs/evidence`.

## Report and Evidence

- Main report: `docs/reports/technical-issues-and-fixes-report.md`
- Evidence index: `docs/README.md`
- Runtime logs/screenshots/diffs: `docs/evidence/`
