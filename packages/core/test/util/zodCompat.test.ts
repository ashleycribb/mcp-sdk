
import { describe, it, expect } from 'vitest';
import { getParseErrorMessage } from '../../src/util/zodCompat.js';

describe('getParseErrorMessage', () => {
    it('should return error.message if present', () => {
        const error = { message: 'test message' };
        expect(getParseErrorMessage(error)).toBe('test message');
    });

    it('should return first issue message if present', () => {
        const error = {
            issues: [
                { message: 'issue 1' },
                { message: 'issue 2' }
            ]
        };
        expect(getParseErrorMessage(error)).toBe('issue 1');
    });

    it('should use JSON.stringify for plain objects', () => {
        const error = { code: 123, detail: 'some detail' };
        expect(getParseErrorMessage(error)).toBe(JSON.stringify(error));
    });

    it('should fallback to String(error) for circular objects', () => {
        const error: any = { prop: 'value' };
        error.self = error;
        expect(getParseErrorMessage(error)).toBe(String(error));
    });

    it('should handle standard Error objects via message property', () => {
        const error = new Error('test error');
        expect(getParseErrorMessage(error)).toBe('test error');
    });

    it('should fallback to String(error) for objects that stringify to empty object but have useful toString', () => {
        const error = {
            toString() { return 'Custom Error'; }
        };
        // JSON.stringify({}) is "{}"
        expect(getParseErrorMessage(error)).toBe('Custom Error');
    });

    it('should handle primitives correctly', () => {
        expect(getParseErrorMessage('string error')).toBe('string error');
        expect(getParseErrorMessage(123)).toBe('123');
        expect(getParseErrorMessage(null)).toBe('null');
        expect(getParseErrorMessage(undefined)).toBe('undefined');
    });

    it('should fallback to String(error) if JSON.stringify throws', () => {
        const error = {
            toJSON() {
                throw new Error('fail');
            },
            toString() {
                return 'custom string';
            }
        };
        expect(getParseErrorMessage(error)).toBe('custom string');
    });
});
