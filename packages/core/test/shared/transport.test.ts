import { describe, it, expect, vi } from 'vitest';
import { createFetchWithInit, normalizeHeaders } from '../../src/shared/transport.js';

describe('transport', () => {
    describe('normalizeHeaders', () => {
        it('should return empty object for undefined headers', () => {
            expect(normalizeHeaders(undefined)).toEqual({});
        });

        it('should handle Headers object', () => {
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', 'Bearer token');
            // Headers object normalizes keys to lowercase
            expect(normalizeHeaders(headers)).toEqual({
                'content-type': 'application/json',
                'authorization': 'Bearer token',
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
                'Authorization': 'Bearer token',
            };
            expect(normalizeHeaders(headers)).toEqual({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token',
            });
        });
    });

    describe('createFetchWithInit', () => {
        it('should return baseFetch if no baseInit is provided', () => {
            const mockFetch = vi.fn();
            const fetchWithInit = createFetchWithInit(mockFetch);
            expect(fetchWithInit).toBe(mockFetch);
        });

        it('should call baseFetch with baseInit merged', async () => {
            const mockFetch = vi.fn().mockResolvedValue(new Response());
            const baseInit = {
                headers: { 'X-Base': 'true' },
                mode: 'cors' as const,
            };
            const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

            await fetchWithInit('https://example.com/api', {
                method: 'POST',
                headers: { 'X-Custom': 'true' },
            });

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', {
                headers: {
                    'X-Base': 'true',
                    'X-Custom': 'true',
                },
                mode: 'cors',
                method: 'POST',
            });
        });

        it('should override baseInit properties with request init', async () => {
            const mockFetch = vi.fn().mockResolvedValue(new Response());
            const baseInit = {
                method: 'GET',
                mode: 'no-cors' as const,
            };
            const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

            await fetchWithInit('https://example.com/api', {
                method: 'POST',
                mode: 'cors',
            });

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', {
                headers: undefined,
                method: 'POST',
                mode: 'cors',
            });
        });

        it('should handle headers when only baseInit has headers', async () => {
            const mockFetch = vi.fn().mockResolvedValue(new Response());
            const baseInit = {
                headers: { 'X-Base': 'true' },
            };
            const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

            await fetchWithInit('https://example.com/api');

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', {
                headers: { 'X-Base': 'true' },
            });
        });

        it('should handle headers when only request init has headers', async () => {
            const mockFetch = vi.fn().mockResolvedValue(new Response());
            const baseInit = {
                method: 'GET',
            };
            const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

            await fetchWithInit('https://example.com/api', {
                headers: { 'X-Custom': 'true' },
            });

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', {
                method: 'GET',
                headers: { 'X-Custom': 'true' },
            });
        });

        it('should handle multiple header formats in merge', async () => {
            const mockFetch = vi.fn().mockResolvedValue(new Response());
            const baseHeaders = new Headers();
            baseHeaders.append('X-Base', 'true');

            const baseInit = {
                headers: baseHeaders,
            };
            const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

            await fetchWithInit('https://example.com/api', {
                headers: [['X-Custom', 'true']],
            });

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', {
                headers: {
                    'x-base': 'true',
                    'X-Custom': 'true',
                },
            });
        });
    });
});
