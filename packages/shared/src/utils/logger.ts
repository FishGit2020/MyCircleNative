/**
 * Unified logging utility for MyCircle Native.
 *
 * In production builds React Native strips console.* calls when
 * using Hermes with the production profile. This logger adds a
 * namespace prefix so logs are easy to filter during development.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

// __DEV__ is a React Native global — true in development, false in production
const minLevel: LogLevel = typeof __DEV__ !== 'undefined' && __DEV__ ? 'debug' : 'warn';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
}

function createLogger(namespace: string) {
  const prefix = `[${namespace}]`;
  return {
    debug: (...args: unknown[]) => { if (shouldLog('debug')) console.debug(prefix, ...args); },
    info: (...args: unknown[]) => { if (shouldLog('info')) console.log(prefix, ...args); },
    warn: (...args: unknown[]) => { if (shouldLog('warn')) console.warn(prefix, ...args); },
    error: (...args: unknown[]) => { if (shouldLog('error')) console.error(prefix, ...args); },
  };
}

export type Logger = ReturnType<typeof createLogger>;
export { createLogger };
