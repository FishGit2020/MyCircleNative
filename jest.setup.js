/* eslint-disable no-undef */
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          pauseAsync: jest.fn(),
          stopAsync: jest.fn(),
          unloadAsync: jest.fn(),
          setPositionAsync: jest.fn(),
          setRateAsync: jest.fn(),
          setOnPlaybackStatusUpdate: jest.fn(),
          getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: false }),
        },
        status: { isLoaded: false },
      }),
    },
    setAudioModeAsync: jest.fn(),
  },
  Video: jest.fn(),
}));

// Mock expo-speech-recognition
jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: {
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  },
  useSpeechRecognitionEvent: jest.fn(),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn(),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  dismissBrowser: jest.fn(),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 40.7128, longitude: -74.006 },
  }),
  reverseGeocodeAsync: jest.fn().mockResolvedValue([{ city: 'New York', country: 'US' }]),
}));

// Mock @react-native-firebase/app
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: () => ({
    app: jest.fn(),
  }),
}));

// Mock @react-native-firebase/auth
jest.mock('@react-native-firebase/auth', () => {
  const mockAuth = jest.fn(() => ({
    onAuthStateChanged: jest.fn((cb) => {
      cb(null);
      return jest.fn();
    }),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    currentUser: null,
  }));
  mockAuth.GoogleAuthProvider = { credential: jest.fn() };
  return { __esModule: true, default: mockAuth };
});

// Mock @react-native-firebase/firestore
jest.mock('@react-native-firebase/firestore', () => {
  const mockFirestore = jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ exists: false, data: () => null }),
        set: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
        onSnapshot: jest.fn((cb) => {
          cb({ exists: false, data: () => null });
          return jest.fn();
        }),
      })),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [], empty: true }),
      onSnapshot: jest.fn((cb) => {
        cb({ docs: [], empty: true });
        return jest.fn();
      }),
      add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
    })),
  }));
  mockFirestore.FieldValue = {
    serverTimestamp: jest.fn(() => new Date()),
    delete: jest.fn(),
  };
  return { __esModule: true, default: mockFirestore };
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => '/',
  Link: 'Link',
  Stack: { Screen: 'Screen' },
  Tabs: { Screen: 'Screen' },
}));

// Mock @shopify/react-native-skia
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: 'Canvas',
  Path: 'Path',
  Skia: {
    Path: { Make: jest.fn(() => ({ moveTo: jest.fn(), lineTo: jest.fn() })) },
    Paint: jest.fn(() => ({ setColor: jest.fn(), setStrokeWidth: jest.fn() })),
  },
  useCanvasRef: jest.fn(() => ({ current: null })),
  useTouchHandler: jest.fn(),
}));

// Mock @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Feather: 'Feather',
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Swipeable: 'Swipeable',
  GestureHandlerRootView: ({ children }) => children,
  PanGestureHandler: 'PanGestureHandler',
  State: {},
  Directions: {},
}));

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  withScope: jest.fn((cb) => cb({ setContext: jest.fn() })),
}));

// Mock @react-native-firebase/analytics
jest.mock('@react-native-firebase/analytics', () => {
  const mockAnalytics = jest.fn(() => ({
    logEvent: jest.fn().mockResolvedValue(undefined),
    setUserId: jest.fn().mockResolvedValue(undefined),
    setUserProperties: jest.fn().mockResolvedValue(undefined),
  }));
  return { __esModule: true, default: mockAnalytics };
});

// Mock @react-native-firebase/messaging
jest.mock('@react-native-firebase/messaging', () => {
  const mockMessaging = jest.fn(() => ({
    getToken: jest.fn().mockResolvedValue('mock-token'),
    onMessage: jest.fn(() => jest.fn()),
    requestPermission: jest.fn().mockResolvedValue(1),
    hasPermission: jest.fn().mockResolvedValue(1),
  }));
  return { __esModule: true, default: mockMessaging };
});
