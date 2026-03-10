# MyCircleNative — Agent Rules

npm workspaces monorepo · Expo SDK 54 · React Native · NativeWind v4 · TypeScript

## Workflow

```
git checkout -b feat/my-feature
# implement (honor rules below)
npm test --workspaces --if-present
npx tsc --noEmit
git add <files> && git commit --no-verify -m "feat: description"
git push -u origin HEAD
gh pr create --title "feat: description" --body "summary"
gh pr checks <PR#> --watch
gh pr merge <PR#> --squash --admin
git checkout main && git pull origin main
```

Branch prefixes: `feat/` `fix/` `docs/` `refactor/` `test/`
Commits: [Conventional Commits](https://www.conventionalcommits.org/), imperative, under 72 chars.

## Must-Follow Rules

- **i18n**: Every visible string uses `t('key')`. Add keys to all 3 locales (`en`, `es`, `zh`) in `packages/shared/src/i18n/locales/`.
- **Dark mode**: Every NativeWind color class needs a `dark:` variant. Use `useTheme()` for conditional logic.
- **a11y**: Use `accessibilityLabel` on interactive elements, touch targets >= 44px, `accessibilityRole` where appropriate.
- **NativeWind**: Use `className` prop with Tailwind classes. All RN core components support it via NativeWind v4.
- **Monorepo packages**: Each feature lives in `packages/<feature>/src/`. The app shell (`app/`) imports from packages.
- **AsyncStorage not localStorage**: Use `safeGetItem`/`safeSetItem` from `@mycircle/shared` (sync in-memory cache backed by AsyncStorage). Never use `localStorage`.
- **EventBus not DOM events**: Use `eventBus.publish()`/`eventBus.subscribe()` instead of `window.dispatchEvent`/`addEventListener`.
- **Spanish i18n**: File uses Unicode escapes (`\u00f3`). Always read the exact line before editing.

## Project Structure

```
MyCircleNative/
├── app/                    # Expo Router (file-based routes)
│   ├── _layout.tsx         # Root layout (providers)
│   ├── (tabs)/             # Bottom tab navigator
│   └── (auth)/             # Auth screens
├── packages/
│   ├── shared/             # Types, i18n, utils, GraphQL, constants
│   ├── weather/            # Weather feature
│   ├── stocks/             # Stock tracker
│   ├── podcasts/           # Podcast player
│   ├── ai-assistant/       # AI chat
│   ├── bible-reader/       # Bible reader
│   ├── worship-songs/      # Worship songs
│   ├── notebook/           # Notebook
│   ├── baby-tracker/       # Baby tracker
│   ├── child-development/  # Child dev milestones
│   ├── flashcards/         # Flashcards
│   ├── daily-log/          # Daily log
│   └── city-search/        # City search
├── src/
│   ├── components/         # Shared UI components
│   ├── contexts/           # AuthContext, ThemeContext
│   └── firebase/           # Firebase config, auth, firestore
└── ...configs
```

## Web → React Native Equivalents

| Web | React Native |
|-----|-------------|
| `localStorage` | `safeGetItem`/`safeSetItem` (AsyncStorage cache) |
| `window.dispatchEvent` | `eventBus.publish()` |
| `window.addEventListener` | `eventBus.subscribe()` |
| Web Speech API | `@react-native-voice/voice` / `expo-speech` |
| Web Audio API | `expo-av` |
| HTML5 Canvas | `@shopify/react-native-skia` |
| React Router | Expo Router (`router.push()`) |
| Tailwind CSS | NativeWind v4 (`className`) |
| `import.meta.env.PROD` | `__DEV__` global |
| `btoa`/`atob` | Store plain strings (no base64 needed) |

## iOS-Specific Rules

- **Safe area in Modals**: Use `useSafeAreaInsets()` with inline `style={{ paddingTop: insets.top }}` — not `SafeAreaView` with `className` (NativeWind breaks it in modals).
- **No `SafeAreaView` anywhere**: NativeWind wraps `SafeAreaView` (from both `react-native` and `react-native-safe-area-context`) and triggers "Couldn't find a navigation context" crashes. For screens inside Expo Router, use plain `<View>` — the router handles safe areas. For `<Modal>`, use `useSafeAreaInsets()` with inline `style={{ paddingTop: insets.top }}`.
- **Native module install = rebuild**: After `npx expo install <native-package>`, run `rm -rf ios && npx expo prebuild --platform ios --clean && SENTRY_DISABLE_AUTO_UPLOAD=true npx expo run:ios`.
- **Build command**: `SENTRY_DISABLE_AUTO_UPLOAD=true npx expo run:ios` (Sentry not yet configured).
- **See [iOS Development Setup](./docs/ios-development-setup.md)** for full guide (App Check, device setup, troubleshooting).

## Test Gotchas

- Use `jest-expo` preset, not plain Jest
- `jest.fn(() => obj)` is NOT a constructor — use real `class` mocks
- External callbacks triggering React state need `act()` wrapping
- AsyncStorage is mocked automatically by `@react-native-async-storage/async-storage/jest/async-storage-mock`
- NativeWind classes may not render in tests — test behavior, not styles

## Removing Features

Filter stale AsyncStorage IDs or the app crashes:
```ts
const VALID_IDS = new Set(DEFAULT_LAYOUT.map(w => w.id));
const filtered = parsed.filter(w => VALID_IDS.has(w.id));
```
Also: remove i18n keys from all 3 locales, remove feature package from `packages/`, update `tailwind.config.js` content array.

## Docs

- [README](./README.md) — Project overview, setup, features
- [iOS Development Setup](./docs/ios-development-setup.md) — Build, App Check, device setup, troubleshooting
