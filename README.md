# MyCircleNative — iOS App

A native iOS app built with **React Native + Expo**, replicating all features from the [MyCircle](https://github.com/FishGit2020/MyCircle) web PWA. Uses a monorepo architecture with npm workspaces for separation of concerns across 13 feature packages.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 + React Native |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based, React Navigation) |
| Styling | NativeWind v4 (Tailwind CSS for RN) |
| Data | Apollo Client 3 + GraphQL |
| Auth | Firebase Auth (@react-native-firebase) |
| Database | Firestore (@react-native-firebase) |
| Storage | AsyncStorage + expo-secure-store |
| i18n | Custom I18nProvider (en, es, zh) |
| Audio | expo-av |
| Speech | expo-speech + @react-native-voice/voice |
| Canvas | @shopify/react-native-skia |
| Charts | react-native-gifted-charts |
| Build | EAS Build (cloud iOS builds from Windows) |

## Features

### Dashboard
- Scrollable widget grid (weather, stocks, verse of the day, now playing, etc.)
- Widget visibility toggles stored in AsyncStorage
- Pull-to-refresh

### Weather
- Current conditions, 7-day forecast, hourly forecast
- Air Quality Index with color-coded levels
- Historical comparison ("This Day Last Year")
- What to Wear suggestions, Activity suggestions
- Geolocation via expo-location

### Stocks & Crypto
- Real-time stock quotes and watchlist
- Crypto tracker with 7-day sparkline charts
- Company news feed

### Podcasts
- Browse, search, trending, genre filtering
- Background audio playback via expo-av
- Persistent mini-player above tab bar
- Playback speed control (0.5x-2x)
- Subscriptions synced to Firestore

### AI Assistant
- Chat with Gemini via GraphQL
- Voice input via @react-native-voice/voice
- Tool calling (weather, stocks, navigation, etc.)
- Suggested prompt chips

### Bible Reader
- 66 books, 19+ translations via YouVersion API
- Font size adjustment, bookmarks
- Daily devotional with completion tracking
- Share via expo-sharing
- Deep linking support

### Worship Songs
- ChordPro parsing and rendering
- Real-time transposition
- Auto-scroll with adjustable speed
- Metronome via expo-av with haptic feedback
- Capo calculator
- Favorites synced to Firestore

### Notebook
- Personal + public notes
- Firestore real-time sync
- Search and filter

### Baby Tracker
- Week-by-week growth tracking
- Fruit/animal size comparisons
- Development timeline with Bible verses
- Due date picker

### Child Development
- 195 CDC/AAP milestones across 9 age ranges, 5 domains
- Expandable timeline (past/current/future)
- Red flag indicators
- Auto-age calculation from birth date

### Flashcards
- Chinese characters, English phrases, Bible verses, custom cards
- Handwriting practice via react-native-skia
- 3D flip animation via react-native-reanimated
- Spaced repetition tracking

### Work Tracker
- Daily work log entries
- Timeline visualization
- Firestore real-time sync

### Settings
- Language selector (English, Spanish, Chinese)
- Unit toggles (temperature, speed)
- Theme toggle (light/dark/system)
- Notification preferences
- Account management

## Project Structure

```
MyCircleNative/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout (providers)
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── index.tsx             # Dashboard
│   │   ├── weather.tsx           # Weather
│   │   ├── stocks.tsx            # Stocks
│   │   ├── podcasts.tsx          # Podcasts
│   │   ├── bible.tsx             # Bible
│   │   └── more.tsx              # More menu
│   └── (auth)/                   # Login / Register
├── packages/                     # Feature packages (npm workspaces)
│   ├── shared/                   # Types, i18n, utils, GraphQL
│   ├── weather/                  # Weather feature components
│   ├── stocks/                   # Stock tracker components
│   ├── podcasts/                 # Podcast player components
│   ├── ai-assistant/             # AI chat components
│   ├── bible-reader/             # Bible reader components
│   ├── worship-songs/            # Worship songs components
│   ├── notebook/                 # Notebook components
│   ├── baby-tracker/             # Baby tracker components
│   ├── child-development/        # Child dev components
│   ├── flashcards/               # Flashcard components
│   ├── work-tracker/             # Work tracker components
│   └── city-search/              # City search components
├── src/
│   ├── components/               # Shared UI components
│   ├── contexts/                 # Auth, Theme contexts
│   └── firebase/                 # Firebase integration
└── assets/                       # Images, fonts, icons
```

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Apple Developer account (for TestFlight/App Store)

### Setup
```bash
# Clone the repo
git clone https://github.com/FishGit2020/MyCircleNative.git
cd MyCircleNative

# Install dependencies
npm install

# Start the development server
npx expo start
```

### iOS Development Build
```bash
# Create a development build (requires EAS)
eas build --profile development --platform ios

# Create a preview build for TestFlight
eas build --profile preview --platform ios

# Create a production build for App Store
eas build --profile production --platform ios
```

### Firebase Setup
1. Add an iOS app in Firebase Console with bundle ID `com.mycircle.native`
2. Download `GoogleService-Info.plist` and place in project root
3. EAS Build will pick it up automatically via config plugins

## Same Backend

This app uses the **same Firebase project and GraphQL server** as the web app:
- Firebase Auth (Google Sign-In + email/password)
- Firestore (user profiles, notes, worship songs, work entries)
- GraphQL API at `https://mycircle-graphql.onrender.com/graphql`

No backend changes are needed — the native app is a new client for the existing API.

## Related

- [MyCircle (Web PWA)](https://github.com/FishGit2020/MyCircle) — The original web application
