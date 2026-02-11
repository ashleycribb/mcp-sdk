import { describe, expect, it, vi } from 'vitest';
import { createFetchWithInit, normalizeHeaders } from '../../src/shared/transport.js';

describe('normalizeHeaders', () => {
    it('should return empty object for undefined', () => {
        expect(normalizeHeaders(undefined)).toEqual({});
    });

    it('should normalize Headers object', () => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'text/plain');
        expect(normalizeHeaders(headers)).toEqual({
            'content-type': 'application/json',
            'accept': 'text/plain'
        });
    });

    it('should normalize array of tuples', () => {
        const headers: [string, string][] = [
            ['Content-Type', 'application/json'],
            ['Accept', 'text/plain']
        ];
        expect(normalizeHeaders(headers)).toEqual({
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        });
    });

    it('should normalize plain object', () => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        };
        expect(normalizeHeaders(headers)).toEqual({
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        });
    });
});

describe('createFetchWithInit', () => {
    it('should return baseFetch if no baseInit provided', () => {
        const mockFetch = vi.fn();
        const fetchWithInit = createFetchWithInit(mockFetch);
        expect(fetchWithInit).toBe(mockFetch);
    });

    it('should merge baseInit and call-specific init', async () => {
        const mockFetch = vi.fn().mockResolvedValue(new Response());
        const baseInit = { mode: 'cors' as RequestMode, credentials: 'omit' as RequestCredentials };
        const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

        await fetchWithInit('http://example.com', { method: 'POST' });

        expect(mockFetch).toHaveBeenCalledWith('http://example.com', {
            mode: 'cors',
            credentials: 'omit',
            method: 'POST',
            headers: undefined
        });
    });

    it('should override baseInit with call-specific init', async () => {
        const mockFetch = vi.fn().mockResolvedValue(new Response());
        const baseInit = { method: 'GET', mode: 'cors' as RequestMode };
        const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

        await fetchWithInit('http://example.com', { method: 'POST' });

        expect(mockFetch).toHaveBeenCalledWith('http://example.com', {
            method: 'POST',
            mode: 'cors',
            headers: undefined
        });
    });

    it('should merge headers correctly', async () => {
        const mockFetch = vi.fn().mockResolvedValue(new Response());
        const baseInit = {
            headers: {
                'Authorization': 'Bearer token',
                'Content-Type': 'application/json'
            }
        };
        const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

        await fetchWithInit('http://example.com', {
            headers: {
                'Accept': 'text/plain',
                'Content-Type': 'text/xml' // Override
            }
        });

        expect(mockFetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({
            headers: {
                'Authorization': 'Bearer token',
                'Content-Type': 'text/xml',
                'Accept': 'text/plain'
            }
        }));
    });

    it('should handle Headers object in init', async () => {
        const mockFetch = vi.fn().mockResolvedValue(new Response());
        const baseInit = {
            headers: { 'Authorization': 'Bearer token' }
        };
        const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

        const callHeaders = new Headers();
        callHeaders.append('Accept', 'text/plain');

        await fetchWithInit('http://example.com', { headers: callHeaders });

        expect(mockFetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({
            headers: expect.objectContaining({
                'Authorization': 'Bearer token',
                'accept': 'text/plain' // Headers object lowercases keys
            })
        }));
    });

     it('should handle array headers in init', async () => {
        const mockFetch = vi.fn().mockResolvedValue(new Response());
        const baseInit = {
            headers: { 'Authorization': 'Bearer token' }
        };
        const fetchWithInit = createFetchWithInit(mockFetch, baseInit);

        const callHeaders: [string, string][] = [['Accept', 'text/plain']];

        await fetchWithInit('http://example.com', { headers: callHeaders });

        expect(mockFetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({
            headers: {
                'Authorization': 'Bearer token',
                'Accept': 'text/plain'
            }
        }));
    });
});
