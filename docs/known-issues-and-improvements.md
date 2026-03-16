# Known Issues & Improvements

Issues found during setup audit on 2026-03-16. Organized by priority.

---

## Critical: Build/Type Errors

### 1. `@mycircle/transit-tracker` missing from root `package.json`

**File:** `package.json` (root)
**Symptom:** `tsc --noEmit` fails with `Cannot find module '@mycircle/transit-tracker'`
**Cause:** The `transit-tracker` package exists in `packages/transit-tracker/` and is imported in `app/transit-tracker.tsx`, but is not listed in the root `package.json` dependencies.
**Fix:** Add `"@mycircle/transit-tracker": "workspace:*"` to root `package.json` dependencies, then run `pnpm install`.

### 2. TypeScript errors (5 total)

Run `pnpm exec tsc --noEmit` to reproduce. Current errors:

| File | Error | Likely Fix |
|------|-------|-----------|
| `app/transit-tracker.tsx:4` | Cannot find module `@mycircle/transit-tracker` | Add to root package.json (see #1) |
| `packages/city-search/src/CitySearchScreen.tsx:286` | `edges` prop doesn't exist on `View` | Should be `SafeAreaView` from `react-native-safe-area-context`, or remove `edges` prop |
| `packages/podcasts/src/components/AudioPlayer.tsx:78,173` | `rate` doesn't exist on `AudioPlayer` | expo-audio v55 API changed; use `player.setPlaybackRate()` or check expo-audio docs |
| `src/contexts/ThemeContext.tsx:46` | `"unspecified"` not assignable to `"light" \| "dark" \| null` | Filter out `"unspecified"` from `useColorScheme()` result |

### 3. Test failures (2 of 193)

**File:** `app/__tests__/settings.test.tsx:160`
**Symptom:** `getByText('units.speed')` not found — the i18n key is missing or the component changed.
**Fix:** Check if the speed unit settings UI was removed/renamed and update the test accordingly.

---

## High: Documentation Inaccuracies

### 4. README says `npm` but project uses `pnpm`

**Files:** `README.md`, `docs/ios-development-setup.md`, `docs/architecture.md`
**Issue:** All docs reference `npm install` and `npm run` commands, but the project uses pnpm (`packageManager: "pnpm@10.0.0"`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`). Running `npm install` will create a conflicting `package-lock.json` (which is gitignored) and may not resolve workspace packages correctly.
**Fix:** Replace all `npm install` → `pnpm install`, `npm run` → `pnpm run` across docs.

### 5. Stale Expo SDK version in docs

**Files:** `CLAUDE.md:3`, `README.md:9`
**Issue:** Both say "Expo SDK 54" but `package.json` has `expo: ^55.0.0` and `npx expo --version` returns 55.0.15.
**Fix:** Update to "Expo SDK 55".

### 6. Stale React Native version in `docs/architecture.md`

**File:** `docs/architecture.md:13`
**Issue:** Says "React Native 0.81" but `package.json` has `react-native: 0.83.2`.
**Fix:** Update to "React Native 0.83".

### 7. `docs/architecture.md` says "Apollo Client 4"

**File:** `docs/architecture.md:15`
**Issue:** Says "Apollo Client 4" but the project explicitly uses v3 (`@apollo/client: ^3.12.11`) because v4 is incompatible with Hermes (documented in ios-development-setup.md troubleshooting).
**Fix:** Update to "Apollo Client 3".

### 8. iOS bundle ID inconsistency

**Files:** `docs/ios-development-setup.md:8`, `app.json:18`
**Issue:** ios-development-setup.md says bundle ID is `com.mycircle.app` but `app.json` has `com.youpenghuang.mycircle`.
**Fix:** Update the doc to `com.youpenghuang.mycircle`.

### 9. Node.js version inconsistency

**Files:** `README.md` says "Node.js 20+", `docs/ios-development-setup.md` says "Node.js 22+"
**Fix:** Align on one version (20+ is fine given package.json has no engines field).

### 10. CLAUDE.md doesn't reference `docs/architecture.md`

**File:** `CLAUDE.md:109`
**Issue:** The Docs section only lists README and ios-development-setup but not the architecture doc.
**Fix:** Add `- [Architecture](./docs/architecture.md) — Tech stack, data flow, key patterns`

### 11. Package lists in docs are stale

**Files:** `CLAUDE.md`, `README.md`, `docs/architecture.md`
**Issue:** The project structure trees list 12-22 packages but there are actually 25 in `packages/`. Missing from most/all lists: `ai-interviewer`, `cloud-files`, `immigration-tracker`, `model-benchmark`, `radio-station`, `poll-system`, `trip-planner`, `digital-library`, `family-games`, `doc-scanner`, `hiking-map`, `transit-tracker`.
**Fix:** Update all package listings to reflect current state.

---

## Medium: Missing Infrastructure

### 12. No `.github/workflows/` directory

**Issue:** README and architecture.md reference three CI/CD workflows (`ci.yml`, `build.yml`, `preview.yml`) but no `.github/` directory exists in the repo.
**Fix:** Either create the workflows or remove the CI/CD documentation until they're implemented.

### 13. ESLint warnings (350)

**Symptom:** `pnpm exec eslint .` reports 350 warnings (0 errors). Mostly `@typescript-eslint/no-explicit-any` and `react-hooks/exhaustive-deps`.
**Fix:** Gradually address warnings; consider adding `--max-warnings` to CI to prevent regression.

### 14. Missing `onlyBuiltDependencies` config

**Symptom:** `pnpm install` warns about ignored build scripts for `@firebase/util`, `@sentry/cli`, `@shopify/react-native-skia`, `dtrace-provider`, `protobufjs`.
**Fix:** Add `"pnpm": { "onlyBuiltDependencies": [...] }` to root `package.json` to explicitly allow needed build scripts.

---

## Low: Nice to Have

### 15. `docs/architecture.md` step 10 says `npm install`

In the "Adding a New Feature" section, step 10 says `npm install` — should be `pnpm install`.

### 16. `.env.example` references a placeholder GraphQL endpoint

**File:** `.env.example`
**Issue:** Shows `GRAPHQL_ENDPOINT=https://your-project.cloudfunctions.net/graphql` but the actual endpoint is hardcoded in `app.json` as `https://mycircle-graphql.onrender.com/graphql`. The `.env` file may not actually be used.
**Fix:** Either wire up `.env` usage or update the example to match the real endpoint and note that it's currently hardcoded in `app.json`.
