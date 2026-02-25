import { getErrorMessage } from '../getErrorMessage';

describe('getErrorMessage', () => {
  it('returns the message from an Error object', () => {
    const error = new Error('something went wrong');
    expect(getErrorMessage(error)).toBe('something went wrong');
  });

  it('returns the message from a TypeError', () => {
    const error = new TypeError('cannot read property');
    expect(getErrorMessage(error)).toBe('cannot read property');
  });

  it('returns string inputs directly', () => {
    expect(getErrorMessage('plain string error')).toBe('plain string error');
  });

  it('returns an empty string input as-is', () => {
    expect(getErrorMessage('')).toBe('');
  });

  it('handles null with a fallback message', () => {
    expect(getErrorMessage(null)).toBe('An unknown error occurred');
  });

  it('handles undefined with a fallback message', () => {
    expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
  });

  it('extracts message from a plain object with a message property', () => {
    const errorLike = { message: 'object error message' };
    expect(getErrorMessage(errorLike)).toBe('object error message');
  });

  it('returns fallback for objects without a message property', () => {
    expect(getErrorMessage({ code: 404 })).toBe('An unknown error occurred');
  });

  it('returns fallback for objects where message is not a string', () => {
    expect(getErrorMessage({ message: 123 })).toBe('An unknown error occurred');
  });

  it('returns fallback for numeric inputs', () => {
    expect(getErrorMessage(42)).toBe('An unknown error occurred');
  });

  it('returns fallback for boolean inputs', () => {
    expect(getErrorMessage(true)).toBe('An unknown error occurred');
    expect(getErrorMessage(false)).toBe('An unknown error occurred');
  });

  it('handles Error subclasses', () => {
    class CustomError extends Error {
      code: number;
      constructor(message: string, code: number) {
        super(message);
        this.code = code;
      }
    }
    const error = new CustomError('custom error', 500);
    expect(getErrorMessage(error)).toBe('custom error');
  });
});
