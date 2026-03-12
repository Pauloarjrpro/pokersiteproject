# Technical Issues and Fixes Report - PokerSiteProject

## 1. Executive Summary
This assessment identified **16 technical issues** across backend and frontend layers, including validation faults, authorization gaps, security risks, API integration problems, and runtime reliability defects. Runtime verification and automated checks were performed on the updated codebase.

Runtime captures were included as execution samples from the running server.

## 2. Scope and Method
The analysis combined static code review of backend and frontend modules, targeted remediation of identified defects, automated validation through `npm test`, `npm run build`, and `node --check`, and runtime endpoint verification with the server running.

## 3. Findings Overview (16 Issues)
1. `express-validator` checks were broken (`isEmpty` used without `()`).
2. Missing imports and undefined variables caused runtime instability.
3. Sensitive endpoint `/getAmount` was exposed without auth.
4. Game update/kick operations lacked strict ownership/admin checks.
5. Tournament update/start/member update lacked strict ownership/admin checks.
6. Tournament join trusted client-provided `player_id` and allowed duplicates.
7. Sequelize `findOne` calls were malformed (missing `where` in some places).
8. WebSocket `kickUser` logic did not reliably enforce room targeting.
9. WebSocket quit flow could reference a null game in edge cases.
10. WebSocket random-seat selection had off-by-one behavior.
11. WebSocket message parsing had no defensive JSON handling.
12. Bet actions accepted unsafe/invalid amounts.
13. Dynamic code execution existed in `GameRoom.errorHandler` (critical security risk).
14. Tournament result broadcast referenced wrong winner variable.
15. Frontend wallet/account endpoints used incorrect paths (`./api/...`).
16. Frontend token and routing flow had inconsistencies (`accessToken` vs `token`, wallet route, WS command typos).

## 4. How Each Issue Was Resolved

Fixes are grouped by category, with each section addressing one or more of the identified issues.

- Validation and runtime safety: replaced all invalid `!validResult.isEmpty` checks with `!validResult.isEmpty()`; added required `fs/path` imports; fixed the undefined token reference in account amount flow; made avatar assignment in registration safe when no file is present.
- Access control hardening: added explicit owner/admin checks in game and tournament mutation endpoints; protected `/api/account/getAmount` with auth middleware.
- Data integrity and query correctness: enforced server-side identity in tournament join (`req.user.id`); blocked duplicate tournament join rows; corrected malformed Sequelize `findOne` usage with `where` clauses.
- WebSocket reliability: added safe JSON parse handling for incoming payloads; validated bet amounts before game actions; fixed seat-selection boundary logic; stabilized quit/kick edge cases and room scoping.
- Security: removed the dynamic code execution pattern (`Function.constructor`) and replaced it with safe error logging.
- Frontend/API consistency: fixed account endpoint paths to absolute `/api/...`; aligned registration token handling with backend response (`token`); corrected wallet navigation to `/account/wallet`; corrected tournament WS command typo and SCOOP creation endpoint usage.
- Test stabilization: added a controlled axios mock for test environment compatibility; replaced the obsolete default app test with a stable setup test.

## 5. Annotated Code Snippets

### 1) Validation Fix (`isEmpty()`)
```js
const validResult = validationResult(req);
// Call isEmpty() as a function; otherwise validation is never evaluated correctly.
if (!validResult.isEmpty()) {
  return ResponseData.warning(res, validResult.array()[0].msg);
}
```

### 2) Ownership/Admin Authorization (Game Update)
```js
const room = await rooms.findByPk(req.body.roomId);
// Only the room owner or admin can mutate room settings.
const isOwner = Number(room.owner) === Number(user.id) || Number(user.role) === 1;
if (!isOwner) {
  return ResponseData.warning(res, "You don't have permission to update this game");
}
```

### 3) Server-Side Identity Enforcement (Tournament Join)
```js
const user = req.user;
// Never trust player_id from client payload; use authenticated user identity.
const joined = await tournament_users.findOne({
  where: { tournament_id: tournamentId, user_id: user.id }
});
if (joined) {
  return ResponseData.warning(res, "You already joined this tournament");
}
```

### 4) Safe WebSocket Payload Handling
```js
let data = null;
try {
  data = JSON.parse(_data);
} catch (err) {
  // Reject malformed payloads instead of crashing the socket handler.
  ws.send(JSON.stringify({ success: false, message: "Invalid payload" }));
  return;
}
```

### 5) Security Fix - Remove Dynamic Execution
```js
errorHandler(error) {
  // Log external service failures safely; do not execute remote code.
  console.error('checkAPI error:', error);
}
```

### 6) Frontend Token Consistency
```js
const response = await axios.post(API_AUTH.register, iForm);
const { token, user } = response.data.result;
// Keep session setup consistent with backend token contract.
setSession(token);
```

## 6. Validation Results
- `npm test`: **PASS** (1 suite, 1 test passed).
- `npm run build`: **Success** (project builds; pre-existing lint warnings remain).
- `node --check` on updated backend files: **No syntax errors**.
- Runtime endpoint verification (`POST /api/account/login` with empty body): `201` (validation response, no internal error).
- Runtime endpoint verification (`GET /api/game/get-pool`): `200` with successful JSON response after local MySQL setup and schema sync.

## 7. Evidence Files
Supporting materials used during the analysis and validation process are stored in the `/docs` directory.

These files include:
- issue inventory and technical notes
- runtime output samples
- build and test logs
- fix diff summary

All evidence files are reproducible from the project execution environment.

## 8. Notes
This report documents 16 technical findings and their implemented fixes, with execution and validation evidence captured during the assessment workflow.
During final local persistence validation on MySQL 9.6, two minimal schema-compatibility adjustments were applied: integer defaults in `TournamentUser.model.js` and numeric type mapping in `Transaction.model.js`.
