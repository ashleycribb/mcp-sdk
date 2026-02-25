import { normalizeHeaders, createFetchWithInit } from '../../src/shared/transport.js';
import { vi, describe, it, expect } from 'vitest';

describe('normalizeHeaders', () => {
    it('should return empty object for undefined headers', () => {
        expect(normalizeHeaders(undefined)).toEqual({});
    });

    it('should normalize Headers object', () => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('X-Custom-Header', 'value');

        expect(normalizeHeaders(headers)).toEqual({
            'content-type': 'application/json',
            'x-custom-header': 'value'
        });
    });

    it('should normalize array of tuples', () => {
        const headers: [string, string][] = [
            ['Content-Type', 'application/json'],
            ['X-Custom-Header', 'value']
        ];

        // normalizeHeaders preserves case for array inputs
        expect(normalizeHeaders(headers)).toEqual({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'value'
        });
    });

    it('should normalize plain object', () => {
        const headers = {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'value'
        };

        // normalizeHeaders preserves case for object inputs
        expect(normalizeHeaders(headers)).toEqual({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'value'
        });
    });

    it('should handle empty Headers object', () => {
        expect(normalizeHeaders(new Headers())).toEqual({});
    });

    it('should handle empty array', () => {
        expect(normalizeHeaders([])).toEqual({});
    });

    it('should handle empty object', () => {
        expect(normalizeHeaders({})).toEqual({});
    });
});

describe('createFetchWithInit', () => {
    it('should return baseFetch if no baseInit provided', () => {
        const mockFetch = vi.fn();
        const fetchWithInit = createFetchWithInit(mockFetch);
        expect(fetchWithInit).toBe(mockFetch);
    });

    it('should merge baseInit with call-specific init', async () => {
        const mockFetch = vi.fn().mockResolvedValue(new Response());
        const baseInit = {
            headers: { 'Authorization': 'Bearer token' },
            mode: 'cors' as RequestMode
        };

        const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

        await fetchWithInit('https://example.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        expect(mockFetch).toHaveBeenCalledWith('https://example.com', {
            headers: {
                'Authorization': 'Bearer token',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            method: 'POST'
        });
    });

    it('should normalize and merge headers correctly', async () => {
        const mockFetch = vi.fn().mockResolvedValue(new Response());
        const baseInit = {
            headers: [['Authorization', 'Bearer token']] as [string, string][]
        };

        const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

        await fetchWithInit('https://example.com', {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });

        expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
            headers: {
                'Authorization': 'Bearer token',
                'content-type': 'application/json'
            }
        }));
    });
});
