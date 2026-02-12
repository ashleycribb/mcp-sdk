import { describe, test, expect } from 'vitest';
import { getParseErrorMessage } from '../../src/util/zodCompat.js';

describe('getParseErrorMessage', () => {
  test('should return message from Error object', () => {
    const error = new Error('test error');
    expect(getParseErrorMessage(error)).toBe('test error');
  });

  test('should return message from object with message property', () => {
    const error = { message: 'test message' };
    expect(getParseErrorMessage(error)).toBe('test message');
  });

  test('should return message from first issue in issues array', () => {
    const error = {
      issues: [
        { message: 'issue 1' },
        { message: 'issue 2' }
      ]
    };
    expect(getParseErrorMessage(error)).toBe('issue 1');
  });

  test('should return JSON string for plain object', () => {
    const error = { code: 123, details: 'some details' };
    expect(getParseErrorMessage(error)).toBe('{"code":123,"details":"some details"}');
  });

  test('should fall back to String(error) for circular objects', () => {
    const error: any = { prop: 'value' };
    error.self = error;
    expect(getParseErrorMessage(error)).toBe('[object Object]');
  });

  test('should fall back to String(error) for primitives', () => {
    expect(getParseErrorMessage('string error')).toBe('string error');
    expect(getParseErrorMessage(123)).toBe('123');
    expect(getParseErrorMessage(null)).toBe('null');
    expect(getParseErrorMessage(undefined)).toBe('undefined');
  });

  test('should handle object that stringifies to empty object', () => {
    class CustomError {}
    const error = new CustomError();
    // Improved behavior: return String(error) instead of "{}"
    expect(getParseErrorMessage(error)).toBe('[object Object]');
  });

  test('should handle object with toJSON returning undefined', () => {
    const error = { toJSON: () => undefined };
    expect(getParseErrorMessage(error)).toBe('[object Object]');
  });

  test('should handle object with toJSON returning empty string', () => {
    const error = { toJSON: () => "" };
    expect(getParseErrorMessage(error)).toBe('""');
  });
});
