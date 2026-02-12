import type { JSONRPCMessage } from '@modelcontextprotocol/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketClientTransport } from '../../src/client/websocket.js';

describe('WebSocketClientTransport', () => {
    let mockWebSocket: MockWebSocket | undefined;
    let transport: WebSocketClientTransport;
    const url = new URL('ws://localhost:8080');

    class MockWebSocket {
        url: string;
        protocol: string;
        onopen: (() => void) | null = null;
        onclose: (() => void) | null = null;
        onerror: ((event: any) => void) | null = null;
        onmessage: ((event: any) => void) | null = null;
        send = vi.fn();
        close = vi.fn();
        readyState = 0; // CONNECTING

        constructor(url: string | URL, protocol: string) {
            this.url = url.toString();
            this.protocol = protocol;
            mockWebSocket = this;
        }
    }

    beforeEach(() => {
        vi.stubGlobal('WebSocket', MockWebSocket);
        mockWebSocket = undefined;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('starts correctly', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();

        expect(mockWebSocket).toBeDefined();
        mockWebSocket!.onopen?.();

        await startPromise;
    });

    it('handles connection error', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();

        expect(mockWebSocket).toBeDefined();
        const error = new Error('Connection failed');
        mockWebSocket!.onerror?.({ error });

        await expect(startPromise).rejects.toThrow('Connection failed');
    });

    it('handles connection error with event only', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();

        expect(mockWebSocket).toBeDefined();
        mockWebSocket!.onerror?.({ type: 'error' });

        await expect(startPromise).rejects.toThrow(/WebSocket error/);
    });

    it('fails to start if already started', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();
        mockWebSocket!.onopen?.();
        await startPromise;

        expect(() => transport.start()).toThrow('WebSocketClientTransport already started!');
    });

    it('sends messages', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();
        mockWebSocket!.onopen?.();
        await startPromise;

        const message: JSONRPCMessage = {
            jsonrpc: '2.0',
            id: 1,
            method: 'test',
        };

        await transport.send(message);

        expect(mockWebSocket!.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('fails to send when not connected', async () => {
        transport = new WebSocketClientTransport(url);

        const message: JSONRPCMessage = {
            jsonrpc: '2.0',
            id: 1,
            method: 'test',
        };

        await expect(transport.send(message)).rejects.toThrow('Not connected');
    });

    it('receives messages', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();
        mockWebSocket!.onopen?.();
        await startPromise;

        const receivedMessages: JSONRPCMessage[] = [];
        transport.onmessage = (msg) => receivedMessages.push(msg);

        const message: JSONRPCMessage = {
            jsonrpc: '2.0',
            id: 1,
            method: 'test',
            params: { foo: 'bar' },
        };

        mockWebSocket!.onmessage?.({ data: JSON.stringify(message) });

        expect(receivedMessages).toHaveLength(1);
        expect(receivedMessages[0]).toEqual(message);
    });

    it('handles invalid JSON messages', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();
        mockWebSocket!.onopen?.();
        await startPromise;

        const errors: Error[] = [];
        transport.onerror = (err) => errors.push(err);

        mockWebSocket!.onmessage?.({ data: 'invalid json' });

        expect(errors).toHaveLength(1);
    });

    it('handles invalid schema messages', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();
        mockWebSocket!.onopen?.();
        await startPromise;

        const errors: Error[] = [];
        transport.onerror = (err) => errors.push(err);

        mockWebSocket!.onmessage?.({ data: JSON.stringify({ invalid: 'schema' }) });

        expect(errors).toHaveLength(1);
    });

    it('closes connection', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();
        mockWebSocket!.onopen?.();
        await startPromise;

        await transport.close();

        expect(mockWebSocket!.close).toHaveBeenCalled();
    });

    it('handles remote close', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();
        mockWebSocket!.onopen?.();
        await startPromise;

        let closed = false;
        transport.onclose = () => { closed = true; };

        mockWebSocket!.onclose?.();

        expect(closed).toBe(true);
    });

    it('reports error via callback if connected', async () => {
        transport = new WebSocketClientTransport(url);
        const startPromise = transport.start();
        mockWebSocket!.onopen?.();
        await startPromise;

        const errors: Error[] = [];
        transport.onerror = (err) => errors.push(err);

        const error = new Error('Runtime error');
        mockWebSocket!.onerror?.({ error });

        expect(errors).toHaveLength(1);
        expect(errors[0]).toBe(error);
    });
});
