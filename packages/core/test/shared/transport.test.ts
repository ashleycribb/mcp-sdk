import { describe, it, expect, vi } from 'vitest';
import { createFetchWithInit, normalizeHeaders } from '../../src/shared/transport.js';

describe('normalizeHeaders', () => {
  it('should return an empty object if headers are undefined', () => {
    expect(normalizeHeaders(undefined)).toEqual({});
  });

  it('should normalize Headers object', () => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Custom-Header', 'value');
    expect(normalizeHeaders(headers)).toEqual({
      'content-type': 'application/json',
      'x-custom-header': 'value',
    });
  });

  it('should normalize array of tuples', () => {
    const headers: [string, string][] = [
      ['Content-Type', 'application/json'],
      ['X-Custom-Header', 'value'],
    ];
    expect(normalizeHeaders(headers)).toEqual({
      'Content-Type': 'application/json',
      'X-Custom-Header': 'value',
    });
  });

  it('should normalize plain object', () => {
    const headers = {
      'Content-Type': 'application/json',
      'X-Custom-Header': 'value',
    };
    expect(normalizeHeaders(headers)).toEqual(headers);
  });
});

describe('createFetchWithInit', () => {
  it('should return baseFetch if baseInit is not provided', () => {
    const baseFetch = vi.fn();
    const wrappedFetch = createFetchWithInit(baseFetch);
    expect(wrappedFetch).toBe(baseFetch);
  });

  it('should return a wrapped fetch that merges baseInit', async () => {
    const baseFetch = vi.fn().mockResolvedValue(new Response('ok'));
    const baseInit = { method: 'POST', headers: { 'X-Base': '1' } };
    const wrappedFetch = createFetchWithInit(baseFetch, baseInit);

    await wrappedFetch('http://example.com', { body: 'data' });

    expect(baseFetch).toHaveBeenCalledWith('http://example.com', {
      method: 'POST',
      headers: { 'X-Base': '1' },
      body: 'data',
    });
  });

  it('should merge headers correctly', async () => {
    const baseFetch = vi.fn().mockResolvedValue(new Response('ok'));
    const baseInit = { headers: { 'X-Base': '1', 'X-Common': 'base' } };
    const wrappedFetch = createFetchWithInit(baseFetch, baseInit);

    await wrappedFetch('http://example.com', {
      headers: { 'X-Request': '2', 'X-Common': 'request' }
    });

    expect(baseFetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({
      headers: {
        'X-Base': '1',
        'X-Common': 'request',
        'X-Request': '2',
      }
    }));
  });

  it('should handle different header types in merge', async () => {
     const baseFetch = vi.fn().mockResolvedValue(new Response('ok'));
     const baseInit = { headers: [['X-Base', '1']] };
     const wrappedFetch = createFetchWithInit(baseFetch, baseInit as any);

     const requestHeaders = new Headers();
     requestHeaders.append('X-Request', '2');

     await wrappedFetch('http://example.com', {
        headers: requestHeaders
     });

     expect(baseFetch).toHaveBeenCalledWith('http://example.com', expect.objectContaining({
        headers: {
            'X-Base': '1',
            'x-request': '2'
        }
     }));
  });
});
