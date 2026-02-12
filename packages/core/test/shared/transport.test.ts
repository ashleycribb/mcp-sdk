import { describe, expect, it, vi } from 'vitest';
import { createFetchWithInit, normalizeHeaders } from '../../src/shared/transport.js';

describe('normalizeHeaders', () => {
    it('should return empty object for undefined input', () => {
        expect(normalizeHeaders(undefined)).toEqual({});
    });

    it('should handle Headers object', () => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'text/plain');

        expect(normalizeHeaders(headers)).toEqual({
            'content-type': 'application/json',
            'accept': 'text/plain',
        });
    });

    it('should handle array of tuples', () => {
        const headers: [string, string][] = [
            ['Content-Type', 'application/json'],
            ['Authorization', 'Bearer token'],
        ];

        expect(normalizeHeaders(headers)).toEqual({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
        });
    });

    it('should handle plain object', () => {
        const headers = {
            'Content-Type': 'application/json',
            'Custom-Header': 'value',
        };

        expect(normalizeHeaders(headers)).toEqual({
            'Content-Type': 'application/json',
            'Custom-Header': 'value',
        });
    });
});

describe('createFetchWithInit', () => {
    it('should return baseFetch directly if no baseInit is provided', async () => {
        const mockFetch = vi.fn();
        const wrappedFetch = createFetchWithInit(mockFetch);

        expect(wrappedFetch).toBe(mockFetch);

        await wrappedFetch('https://example.com');
        expect(mockFetch).toHaveBeenCalledWith('https://example.com');
    });

    it('should merge baseInit and call-specific init', async () => {
        const mockFetch = vi.fn();
        const baseInit: RequestInit = {
            method: 'POST',
            mode: 'cors',
        };
        const wrappedFetch = createFetchWithInit(mockFetch, baseInit);

        await wrappedFetch('https://example.com', { credentials: 'omit' });

        expect(mockFetch).toHaveBeenCalledWith('https://example.com', {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: undefined,
        });
    });

    it('should merge headers correctly', async () => {
        const mockFetch = vi.fn();
        const baseInit: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token1',
            },
        };
        const wrappedFetch = createFetchWithInit(mockFetch, baseInit);

        await wrappedFetch('https://example.com', {
            headers: {
                'Authorization': 'Bearer token2', // Should override
                'X-Custom': 'custom-value',
            },
        });

        expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token2',
                'X-Custom': 'custom-value',
            },
        }));
    });

    it('should use base headers if no init headers provided', async () => {
        const mockFetch = vi.fn();
        const baseInit: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const wrappedFetch = createFetchWithInit(mockFetch, baseInit);

        await wrappedFetch('https://example.com');

        expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
            headers: {
                'Content-Type': 'application/json',
            },
        }));
    });

    it('should handle init properties overriding base properties', async () => {
        const mockFetch = vi.fn();
        const baseInit: RequestInit = {
            method: 'GET',
            cache: 'no-cache',
        };
        const wrappedFetch = createFetchWithInit(mockFetch, baseInit);

        await wrappedFetch('https://example.com', {
            method: 'POST',
        });

        expect(mockFetch).toHaveBeenCalledWith('https://example.com', {
            method: 'POST',
            cache: 'no-cache',
            headers: undefined,
        });
    });
});
