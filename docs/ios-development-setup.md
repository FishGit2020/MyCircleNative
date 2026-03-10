# iOS Development Setup

## Prerequisites

- macOS with Xcode installed
- Node.js 22+, npm
- CocoaPods (`brew install cocoapods`)
- Firebase project with iOS app registered (bundle ID: `com.mycircle.app`)
- `GoogleService-Info.plist` in project root (download from Firebase Console)

## First-Time Build

```bash
# Install dependencies
npm install

# Generate native iOS project
npx expo prebuild --platform ios --clean

# Build and run on simulator
SENTRY_DISABLE_AUTO_UPLOAD=true npx expo run:ios

# Build and run on physical device (plugged in via USB)
SENTRY_DISABLE_AUTO_UPLOAD=true npx expo run:ios --device
```

> First build takes 15-20 minutes (React Native built from source for Firebase compatibility).
> Subsequent builds are incremental and much faster.

## Firebase App Check (Required for Auth)

Firebase App Check is enforced on this project. The iOS simulator cannot pass real attestation, so a **debug token** is needed.

### Setup Steps

1. **Ensure `@react-native-firebase/app-check` is installed** (already in `package.json`)

2. **`firebase.json`** has debug mode enabled:
   ```json
   {
     "react-native": {
       "app_check_debug_enabled": true
     }
   }
   ```

3. **Build and launch the app** on the simulator

4. **Find the debug token** in the simulator logs:
   ```bash
   xcrun simctl spawn booted log show --last 120s \
     --predicate 'message CONTAINS[c] "debug token"' 2>/dev/null
   ```
   You'll see something like:
   ```
   [AppCheckCore] App Check debug token: 'B33F99E6-125F-433C-992F-F6877347AFD1'
   ```

5. **Register the token in Firebase Console:**
   - Go to **Firebase Console** > **App Check** > **Apps**
   - Click the **iOS app** (`com.mycircle.app`)
   - If not registered, select **App Attest** as the provider and click **Register**
   - Click the **overflow menu (three dots)** > **Manage debug tokens**
   - Click **Add debug token** and paste the token from step 4
   - Save

6. **Test auth** — sign in/up should now work on the simulator

### Important Notes

- The debug token is **per simulator instance**. If you reset the simulator, a new token is generated.
- On **physical devices**, App Attest handles attestation automatically (no debug token needed).
- The `app_check_debug_enabled` flag is only active in debug builds. Production builds use App Attest.
- Never commit debug tokens to source control.

## Running on a Physical iPhone

```bash
SENTRY_DISABLE_AUTO_UPLOAD=true npx expo run:ios --device
```

### First-Time Device Setup

1. Plug in your iPhone via USB
2. Trust the computer on your phone when prompted
3. In Xcode: **Settings > Accounts** — add your Apple ID if not already there
4. The build auto-assigns your personal team for code signing
5. After install, on your iPhone: **Settings > General > VPN & Device Management** — trust your developer certificate

### Free Apple ID Limitations

- App expires after **7 days** — reinstall from Xcode/CLI
- Max **3 apps** at a time on one device
- No push notifications, CloudKit, or some entitlements

## Build Configuration

This project uses `expo-build-properties` with:
- `useFrameworks: "static"` — required for Firebase Swift pods (FirebaseAuth, FirebaseFirestore)
- `buildReactNativeFromSource: true` — required for compatibility between `use_frameworks!` and React Native headers

These settings are in `app.json` under the `expo-build-properties` plugin and are applied automatically by `npx expo prebuild`.

## Troubleshooting

### `auth/internal-error` on sign in
App Check is blocking the request. Follow the App Check debug token setup above.

### `FirebaseAuth-Swift.h not found`
Run a clean prebuild: `rm -rf ios && npx expo prebuild --platform ios --clean`

### `Cannot read property 'displayName' of undefined`
Apollo Client v4 is incompatible with Hermes. Use v3: `npm install @apollo/client@3.12.11`

### Sentry upload fails during build
Set `SENTRY_DISABLE_AUTO_UPLOAD=true` before the build command until Sentry org/project is configured.
