# New Developer Setup Guide

Complete guide for building MyCircleNative from a fresh clone.

## Prerequisites

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| Node.js | 20+ | `node -v` |
| pnpm | 10+ | `pnpm -v` |
| Xcode | latest | `xcode-select -v` |
| CocoaPods | latest | `pod --version` |
| EAS CLI (optional) | latest | `eas --version` |

> **Important:** This project uses **pnpm** (not npm). The `packageManager` field in `package.json` is set to `pnpm@10.0.0`. If you don't have pnpm, install it: `npm install -g pnpm@10`

## Step 1: Clone & Install

```bash
git clone https://github.com/FishGit2020/MyCircleNative.git
cd MyCircleNative
pnpm install
```

## Step 2: Firebase Config Files (Required)

The app requires two Firebase config files that are **not in the repo** (gitignored for security):

1. **`google-services.json`** (Android) — download from Firebase Console > Project Settings > Android app (`com.mycircle.app`)
2. **`GoogleService-Info.plist`** (iOS) — download from Firebase Console > iOS app (`com.youpenghuang.mycircle`)

Place both files in the **project root** (`MyCircleNative/`).

Without these files, `expo prebuild` will fail and Firebase auth/firestore will not work.

## Step 3: Verify Setup

```bash
# TypeScript check (expect some known errors, see Known Issues below)
pnpm exec tsc --noEmit

# Run tests
pnpm test

# Lint
pnpm exec eslint .
```

## Step 4: Build & Run

### iOS (macOS only)

```bash
# Generate native iOS project
npx expo prebuild --platform ios --clean

# Build and run on simulator
SENTRY_DISABLE_AUTO_UPLOAD=true npx expo run:ios

# Build and run on physical device
SENTRY_DISABLE_AUTO_UPLOAD=true npx expo run:ios --device
```

> First build takes 15-20 minutes (React Native built from source for Firebase compatibility).

### Android

```bash
# Start emulator (if configured)
pnpm run android:emulator

# Generate native Android project
pnpm run android:prebuild

# Build and run
pnpm run android
```

### Development Server Only (after initial build)

```bash
pnpm start
```

## Step 5: Firebase App Check (Required for Auth)

Firebase App Check is enforced. On simulators, you need a debug token:

1. Build and launch the app on the simulator
2. Find the debug token in logs:
   ```bash
   xcrun simctl spawn booted log show --last 120s \
     --predicate 'message CONTAINS[c] "debug token"' 2>/dev/null
   ```
3. Register the token in Firebase Console > App Check > Apps > iOS app > Manage debug tokens
4. See [iOS Development Setup](./ios-development-setup.md) for full details

## EAS Cloud Builds

Required GitHub/EAS secrets:
- `EXPO_TOKEN` — generate at expo.dev > Account Settings > Access Tokens
- `GOOGLE_SERVICES_JSON` — the Firebase Android config (as EAS secret file)
- `GOOGLE_SERVICE_INFO_PLIST` — the Firebase iOS config (as EAS secret file)
- `play-store-key.json` — Google Play service account key (for store submission only)

```bash
# Install EAS CLI
npm install -g eas-cli

# iOS builds
eas build --profile development --platform ios   # Dev build (simulator)
eas build --profile preview --platform ios        # TestFlight
eas build --profile production --platform ios     # App Store

# Android builds
pnpm run build:dev       # APK for local testing
pnpm run build:preview   # APK for internal testers
pnpm run build:prod      # AAB for Google Play
```

## Project Quick Reference

| What | Where |
|------|-------|
| Package manager | pnpm (NOT npm) |
| Expo SDK | 55 |
| React Native | 0.83.2 |
| Apollo Client | 3.x (v4 is incompatible with Hermes) |
| Routes | `app/` (Expo Router, file-based) |
| Feature packages | `packages/` (25 packages, pnpm workspaces) |
| Shared code | `src/` (components, contexts, firebase) |
| Config plugins | `plugins/` (3 custom Expo config plugins) |
| GraphQL endpoint | `https://mycircle-graphql.onrender.com/graphql` |
| iOS bundle ID | `com.youpenghuang.mycircle` |
| Android package | `com.mycircle.app` |
