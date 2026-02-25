import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeGetJSON,
  initStorage,
} from '../safeStorage';

describe('safeStorage', () => {
  beforeEach(() => {
    // Clear AsyncStorage mock and reset in-memory cache by re-requiring
    // Since the cache is module-level, we use the public API to manage state.
    (AsyncStorage.clear as jest.Mock)();
  });

  describe('safeGetItem / safeSetItem', () => {
    it('returns null for a key that has not been set', () => {
      expect(safeGetItem('nonexistent-key')).toBeNull();
    });

    it('stores and retrieves a basic string', () => {
      safeSetItem('greeting', 'hello world');
      expect(safeGetItem('greeting')).toBe('hello world');
    });

    it('overwrites an existing value', () => {
      safeSetItem('key', 'first');
      expect(safeGetItem('key')).toBe('first');

      safeSetItem('key', 'second');
      expect(safeGetItem('key')).toBe('second');
    });

    it('writes to AsyncStorage in the background', () => {
      safeSetItem('async-key', 'async-value');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('async-key', 'async-value');
    });

    it('does not throw when AsyncStorage.setItem rejects', () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('storage full'));

      expect(() => {
        safeSetItem('fail-key', 'fail-value');
      }).not.toThrow();

      // The in-memory cache should still have the value
      expect(safeGetItem('fail-key')).toBe('fail-value');
    });
  });

  describe('safeRemoveItem', () => {
    it('removes a key from the in-memory cache', () => {
      safeSetItem('remove-me', 'value');
      expect(safeGetItem('remove-me')).toBe('value');

      safeRemoveItem('remove-me');
      expect(safeGetItem('remove-me')).toBeNull();
    });

    it('calls AsyncStorage.removeItem', () => {
      safeSetItem('remove-async', 'value');
      safeRemoveItem('remove-async');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('remove-async');
    });

    it('does not throw when removing a nonexistent key', () => {
      expect(() => {
        safeRemoveItem('never-existed');
      }).not.toThrow();
    });
  });

  describe('safeGetJSON', () => {
    it('parses stored JSON correctly', () => {
      const data = { name: 'test', values: [1, 2, 3] };
      safeSetItem('json-key', JSON.stringify(data));

      const result = safeGetJSON('json-key', { name: '', values: [] as number[] });
      expect(result).toEqual(data);
    });

    it('returns the fallback when the key does not exist', () => {
      const fallback = { default: true };
      const result = safeGetJSON('missing-json', fallback);
      expect(result).toEqual(fallback);
    });

    it('returns the fallback for invalid JSON', () => {
      safeSetItem('bad-json', 'not valid json {{{');
      const fallback = { safe: true };
      const result = safeGetJSON('bad-json', fallback);
      expect(result).toEqual(fallback);
    });

    it('parses arrays correctly', () => {
      safeSetItem('array-key', JSON.stringify([1, 2, 3]));
      const result = safeGetJSON<number[]>('array-key', []);
      expect(result).toEqual([1, 2, 3]);
    });

    it('parses primitive JSON values', () => {
      safeSetItem('number-key', '42');
      expect(safeGetJSON('number-key', 0)).toBe(42);

      safeSetItem('bool-key', 'true');
      expect(safeGetJSON('bool-key', false)).toBe(true);

      safeSetItem('null-key', 'null');
      expect(safeGetJSON('null-key', 'default')).toBeNull();
    });
  });

  describe('initStorage', () => {
    it('hydrates the cache from AsyncStorage', async () => {
      // Pre-populate AsyncStorage mock
      await AsyncStorage.setItem('hydrate-a', 'alpha');
      await AsyncStorage.setItem('hydrate-b', 'beta');

      await initStorage(['hydrate-a', 'hydrate-b', 'hydrate-missing']);

      expect(safeGetItem('hydrate-a')).toBe('alpha');
      expect(safeGetItem('hydrate-b')).toBe('beta');
      expect(safeGetItem('hydrate-missing')).toBeNull();
    });

    it('does not throw when AsyncStorage.multiGet fails', async () => {
      (AsyncStorage.multiGet as jest.Mock).mockRejectedValueOnce(new Error('fail'));

      await expect(initStorage(['some-key'])).resolves.toBeUndefined();
    });
  });
});
