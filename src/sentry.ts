import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

export function initSentry() {
  if (__DEV__) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    profilesSampleRate: 0.1,
    enabled: !__DEV__,
  });
}

export { Sentry };
