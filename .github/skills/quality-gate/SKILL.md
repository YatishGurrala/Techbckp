---
name: quality-gate
description: 'Pre-merge quality gate for this Next.js 16 repo. Use when: finishing a feature, before opening a PR, when user asks to "check / audit / verify" analytics, error handling, or test coverage, or asks "do we need analytics / error handling / tests" on changed code. Audits changed files for (1) GA4 analytics events via src/lib/analytics.ts, (2) error handling on async/route/server boundaries, (3) Vitest unit coverage >=71% on touched files, plus optional Playwright e2e for user-facing flows. Then auto-fixes the gaps it finds. Do NOT use for: greenfield scaffolding, runtime debugging, or perf tuning.'
argument-hint: '[optional: path or glob to scope the audit, e.g. src/app/api/**]'
---

# Quality Gate (Analytics • Error Handling • Tests ≥71%)

A review-then-fix workflow for this repo. Run before merging non-trivial changes.

## When to Use
- User says "check if we need analytics / error handling / tests".
- Before opening a PR or marking a feature done.
- After adding a new route handler (`src/app/api/**/route.ts`), server action, page, or `src/lib/*` module.

## When NOT to Use
- Pure docs/markdown/config changes.
- Throwaway prototypes the user explicitly flagged as experimental.

## Inputs
- Optional scope arg (path/glob). If omitted, use `git diff --name-only origin/main...HEAD` (fall back to staged + unstaged via `git status --porcelain`).

## Procedure

### Step 1 — Collect scope
1. Resolve the file list (arg > git diff > staged).
2. Filter to `.ts`, `.tsx` under `src/`. Drop `*.d.ts`, `*.test.*`, `*.spec.*`.
3. Classify each file:
   - **route**: `src/app/**/route.ts`
   - **page/layout**: `src/app/**/{page,layout}.tsx`
   - **server action**: contains `"use server"`
   - **lib**: `src/lib/**`
   - **component**: `src/components/**`

### Step 2 — Audit Analytics
For each **route**, **server action**, and user-facing **page** with a meaningful action (form submit, mutation, external API call):

- Required: at least one `trackAnalyticsEvent({ eventName, ... })` call from `src/lib/analytics.ts` covering the success path, and ideally one for the failure path.
- Event names must be added to the `AnalyticsEventName` union in [src/lib/analytics.ts](../../../src/lib/analytics.ts) (do not pass arbitrary strings).
- Naming convention: `<domain>_<action>_<outcome>` e.g. `contact_form_submitted`, `contact_form_failed`. Match the existing `notion_*` style.
- Skip rule: pure read-only GET routes that only return cached/static data → analytics optional, mark as N/A with reason.

Report each missing event as a finding: `{ file, line, missing: "analytics", suggestedEvent }`.

### Step 3 — Audit Error Handling
For each route handler, server action, and any `async` function in **lib**:

- All `await` to external systems (`fetch`, Notion SDK, DB, file I/O) must be inside `try/catch` OR the function must declare it propagates (top-level route handlers must catch and return a typed `Response`).
- Route handlers must return JSON with a stable shape on failure, e.g. `{ ok: false, error: { code, message } }`, and an appropriate HTTP status (`400` invalid input, `401` unauthorized, `5xx` internal). Match patterns in [src/app/api/notion-publish/route.ts](../../../src/app/api/notion-publish/route.ts) and [src/app/api/notion-test/route.ts](../../../src/app/api/notion-test/route.ts).
- Never swallow errors silently except for best-effort side-effects (analytics is the only sanctioned case — see the empty `catch {}` in `trackAnalyticsEvent`). Comment must say so.
- Validate inputs at the boundary (route/action). Do not trust client JSON.

Report each gap as: `{ file, line, missing: "error-handling", reason }`.

### Step 4 — Audit Tests (≥71% coverage on touched files)
1. If `vitest` is not installed, install: `npm i -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom` and add scripts:
   - `"test": "vitest run"`
   - `"test:cov": "vitest run --coverage"`
   Add a minimal `vitest.config.ts` with `environment: 'jsdom'`, `coverage.provider: 'v8'`, and `coverage.thresholds: { lines: 71, statements: 71, functions: 71, branches: 60 }` scoped via `coverage.include` to the changed files.
2. Run: `npx vitest run --coverage --reporter=default`.
3. Parse the coverage summary. For each touched file with lines% < 71, record: `{ file, currentLines, missingLines }`.
4. Routes/server actions: prefer integration tests that invoke the exported `GET`/`POST` with a mocked `Request` and assert status + JSON shape + analytics call (mock `trackAnalyticsEvent`).
5. Components: render with `@testing-library/react`, assert visible behavior, not implementation details.
6. Lib pure functions: direct unit tests covering happy path + at least one error branch.

### Step 5 — Optional Playwright (user-facing flows)
Only when the change touches a page with a form, navigation, or interactive widget:
- If `@playwright/test` not installed and the user opts in: `npm i -D @playwright/test && npx playwright install`.
- Add one happy-path spec under `e2e/` covering the primary CTA. Skip otherwise.

### Step 6 — Report
Emit a single markdown table:

| File | Analytics | Error Handling | Lines % | Action |
|------|-----------|----------------|---------|--------|

Followed by a "Findings" list grouped by category and a "Proposed fixes" section.

### Step 7 — Auto-fix (after user confirms)
The user already opted into "review + auto-fix". Default behavior:
1. Show the report from Step 6.
2. Ask one consolidated confirmation: "Apply N fixes across M files?" with the list.
3. On approval, apply edits in this order: error handling → analytics events (also extend the `AnalyticsEventName` union) → tests. Re-run `npm run lint` and `npm run test:cov` after.
4. If coverage still <71% on any file after generated tests, list the uncovered line ranges and stop — do not fabricate tests just to hit the number.

## Completion Criteria
- Every in-scope file is either ✅ on all three checks or has an explicit, justified N/A.
- `npm run lint` passes.
- `npm run test:cov` passes the 71% threshold for touched files.
- No `catch {}` blocks introduced except the documented analytics best-effort case.

## Anti-patterns to Reject
- Adding `expect(true).toBe(true)` style filler tests to game coverage.
- Catching errors only to `console.log` and continue.
- Hard-coding new analytics event names as string literals without updating the union type.
- Wrapping every line in try/catch instead of validating at boundaries.
