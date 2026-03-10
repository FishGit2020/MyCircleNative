# MyCircleNative — Architecture

## Overview

MyCircleNative is a React Native mobile app (iOS/Android) built with Expo SDK 54. It mirrors the MyCircle web PWA feature set while using native platform conventions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Language | TypeScript 5.9 (strict) |
| Navigation | Expo Router v6 (file-based) |
| Styling | NativeWind v4 (Tailwind for RN) |
| Data | Apollo Client 4 (GraphQL) |
| Auth | @react-native-firebase/auth |
| Database | @react-native-firebase/firestore |
| Storage | AsyncStorage (via safeGetItem/safeSetItem) |
| Notifications | @react-native-firebase/messaging (FCM) |
| Error Tracking | @sentry/react-native |
| Analytics | @react-native-firebase/analytics |
| Audio | expo-av |
| Maps/Location | expo-location |
| Build | EAS Build (cloud) |
| CI/CD | GitHub Actions |

## Monorepo Structure

```
MyCircleNative/
├── app/                    # Expo Router (file-based routes)
│   ├── _layout.tsx         # Root layout (providers, auth guard)
│   ├── (tabs)/             # Bottom tab navigator (6 tabs)
│   │   ├── index.tsx       # Dashboard
│   │   ├── weather.tsx     # Weather
│   │   ├── stocks.tsx      # Stocks & Crypto
│   │   ├── podcasts.tsx    # Podcasts
│   │   ├── bible.tsx       # Bible Reader
│   │   └── more.tsx        # Feature menu
│   ├── (auth)/             # Auth screens (login, register)
│   └── *.tsx               # Deep-link screens (24 features)
├── packages/               # 24 feature packages (npm workspaces)
│   ├── shared/             # Types, i18n, GraphQL, utils, constants
│   ├── weather/            # Weather feature
│   ├── stocks/             # Stock tracker
│   ├── podcasts/           # Podcast player
│   ├── ai-assistant/       # AI chat (Gemini)
│   ├── bible-reader/       # Bible reader
│   ├── worship-songs/      # Worship songs
│   ├── notebook/           # Notes
│   ├── baby-tracker/       # Pregnancy tracking
│   ├── child-development/  # CDC milestones
│   ├── flashcards/         # Flashcard learning
│   ├── daily-log/          # Daily work log
│   ├── city-search/        # City autocomplete
│   ├── cloud-files/        # File storage
│   ├── immigration-tracker/# USCIS tracking
│   ├── model-benchmark/    # AI model testing
│   ├── radio-station/      # Internet radio
│   ├── poll-system/        # Community polls
│   ├── trip-planner/       # Travel itineraries
│   ├── digital-library/    # EPUB reader
│   ├── family-games/       # Mini-games
│   ├── doc-scanner/        # Document scanning
│   └── hiking-map/         # Route planner
├── src/
│   ├── components/         # Shared UI (Button, Card, Toast, etc.)
│   ├── contexts/           # AuthContext, ThemeContext
│   ├── firebase/           # Firebase config, auth, firestore, notifications
│   └── sentry.ts           # Sentry initialization
├── schema.graphql          # GraphQL schema (shared with web)
├── codegen.ts              # GraphQL codegen config
└── [config files]          # app.json, eas.json, babel, metro, tailwind, jest
```

## Data Flow

```
User Action → Component → Hook/Context
    ↓                        ↓
  EventBus  ←──────→  AsyncStorage (local cache)
    ↓                        ↓
  Firestore (real-time)   Apollo Client (GraphQL API)
```

### State Management

1. **Apollo Client** — GraphQL queries/mutations to backend API
2. **Firestore** — Real-time user data (profiles, notes, songs, etc.)
3. **AsyncStorage** — Local preferences via `safeGetItem`/`safeSetItem`
4. **EventBus** — Cross-feature pub/sub (replaces DOM events from web)
5. **Context API** — Auth state (AuthContext) and theme (ThemeContext)

### Storage Keys & Events

All storage keys are centralized in `packages/shared/src/constants/storageKeys.ts`.
All event names are in `packages/shared/src/utils/eventBus.ts`.

## Authentication

- Firebase Auth with email/password and Google Sign-In
- Route protection via `useProtectedRoute()` in root layout
- User profiles stored in Firestore `/users/{uid}`
- FCM tokens registered on sign-in, cleaned up on sign-out
- Preferences restored from Firestore to AsyncStorage on login

## Internationalization

- 3 locales: English (en), Spanish (es), Chinese (zh)
- ~2400 translation keys per locale
- `useTranslation()` hook returns `{ t, locale, setLocale }`
- Spanish uses Unicode escapes for accented characters
- Device locale auto-detected via `expo-localization`

## Build & Deploy

### EAS Build Profiles

| Profile | Output | Use Case |
|---------|--------|----------|
| development | APK (simulator) | Local development |
| preview | APK (internal) | PR preview, QA |
| production | AAB (app bundle) | Play Store / App Store |

### CI/CD Pipeline

- **ci.yml**: Lint (ESLint), security audit, unit tests, type check
- **build.yml**: EAS build → Play Store submission (on `v*` tags)
- **preview.yml**: PR preview APK with auto-comment

## Testing

- **Unit tests**: Jest + jest-expo (193 tests, 28 suites)
- **Coverage thresholds**: 12% statements/lines, 10% branches/functions
- **Pre-commit**: Husky runs lint + tests

## Key Patterns

### Web → React Native Equivalents

| Web | React Native |
|-----|-------------|
| localStorage | safeGetItem/safeSetItem (AsyncStorage) |
| window.dispatchEvent | eventBus.publish() |
| window.addEventListener | eventBus.subscribe() |
| Web Speech API | expo-speech-recognition |
| Web Audio API | expo-av |
| HTML5 Canvas | @shopify/react-native-skia |
| React Router | Expo Router (router.push()) |
| Tailwind CSS | NativeWind v4 (className) |
| import.meta.env.PROD | \_\_DEV\_\_ global |

### Adding a New Feature

1. Create `packages/<feature>/src/<Feature>Screen.tsx`
2. Create `packages/<feature>/src/index.ts` (re-export)
3. Create `packages/<feature>/package.json`
4. Create `app/<feature>.tsx` (route wrapper)
5. Add to `app/(tabs)/more.tsx` menu
6. Add i18n keys to all 3 locales
7. Add events/storage keys to shared constants
8. Update `jest.config.js` moduleNameMapper
9. Update `tsconfig.json` paths
10. Run `npm install` to update lockfile
