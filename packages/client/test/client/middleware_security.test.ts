import type { FetchLike } from '@modelcontextprotocol/core';
import type { MockedFunction, MockInstance } from 'vitest';
import { withLogging } from '../../src/client/middleware.js';

describe('withLogging Security', () => {
    let mockFetch: MockedFunction<FetchLike>;
    let consoleLogSpy: MockInstance;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        mockFetch = vi.fn();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    it('should NOT log sensitive request headers', async () => {
        const response = new Response('success', { status: 200, statusText: 'OK' });
        mockFetch.mockResolvedValue(response);

        const enhancedFetch = withLogging({
            includeRequestHeaders: true
        })(mockFetch);

        await enhancedFetch('https://api.example.com/data', {
            headers: {
                'Authorization': 'Bearer secret-token',
                'Cookie': 'session=secret-session',
                'Content-Type': 'application/json'
            }
        });

        expect(consoleLogSpy).toHaveBeenCalled();
        const logMessage = consoleLogSpy.mock.calls[0][0];

        // Should contain non-sensitive headers
        expect(logMessage).toContain('content-type: application/json');

        // Should redact sensitive headers
        expect(logMessage).not.toContain('Bearer secret-token');
        expect(logMessage).not.toContain('session=secret-session');
        expect(logMessage).toContain('authorization: [REDACTED]');
        expect(logMessage).toContain('cookie: [REDACTED]');
    });

    it('should NOT log sensitive response headers', async () => {
        const response = new Response('success', {
            status: 200,
            statusText: 'OK',
            headers: {
                'Set-Cookie': 'session=secret-session',
                'Content-Type': 'application/json'
            }
        });
        mockFetch.mockResolvedValue(response);

        const enhancedFetch = withLogging({
            includeResponseHeaders: true
        })(mockFetch);

        await enhancedFetch('https://api.example.com/data');

        expect(consoleLogSpy).toHaveBeenCalled();
        const logMessage = consoleLogSpy.mock.calls[0][0];

        // Should contain non-sensitive headers
        expect(logMessage).toContain('content-type: application/json');

        // Should redact sensitive headers
        expect(logMessage).not.toContain('session=secret-session');
        expect(logMessage).toContain('set-cookie: [REDACTED]');
    });
});
