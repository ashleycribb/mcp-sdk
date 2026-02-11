import type { JSONRPCMessage } from '@modelcontextprotocol/core';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketClientTransport } from '../../src/client/websocket.js';

describe('WebSocketClientTransport', () => {
    let transport: WebSocketClientTransport;
    let mockWebSocket: MockWebSocket;
    const url = new URL('ws://localhost:3000');

    // Mock WebSocket implementation
    class MockWebSocket {
        url: string;
        protocol: string;
        onopen: (() => void) | null = null;
        onclose: (() => void) | null = null;
        onerror: ((event: Event) => void) | null = null;
        onmessage: ((event: MessageEvent) => void) | null = null;
        readyState: number = 0; // CONNECTING

        constructor(url: string | URL, protocol: string) {
            this.url = url.toString();
            this.protocol = protocol;
            mockWebSocket = this;

            // Simulate async connection
            setTimeout(() => {
                if (this.readyState === 0) {
                     this.readyState = 1; // OPEN
                     this.onopen?.();
                }
            }, 0);
        }

        send(data: string) {
            // Mock implementation
        }

        close() {
            this.readyState = 3; // CLOSED
            this.onclose?.();
        }
    }

    beforeEach(() => {
        // Mock the global WebSocket
        vi.stubGlobal('WebSocket', MockWebSocket);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should connect to the WebSocket server', async () => {
        transport = new WebSocketClientTransport(url);
        await transport.start();
        expect(mockWebSocket.url).toBe(url.toString());
        expect(mockWebSocket.protocol).toBe('mcp');
    });

    it('should send messages', async () => {
        transport = new WebSocketClientTransport(url);
        await transport.start();

        const message: JSONRPCMessage = {
            jsonrpc: '2.0',
            method: 'test',
            params: { foo: 'bar' },
        };

        const sendSpy = vi.spyOn(mockWebSocket, 'send');
        await transport.send(message);

        expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should handle incoming messages', async () => {
        transport = new WebSocketClientTransport(url);
        await transport.start();

        const message: JSONRPCMessage = {
            jsonrpc: '2.0',
            method: 'test',
            params: { foo: 'bar' },
        };

        const onMessageSpy = vi.fn();
        transport.onmessage = onMessageSpy;

        // Simulate incoming message
        const event = new MessageEvent('message', {
            data: JSON.stringify(message),
        });
        mockWebSocket.onmessage?.(event);

        expect(onMessageSpy).toHaveBeenCalledWith(message);
    });

    it('should handle errors', async () => {
        transport = new WebSocketClientTransport(url);
        await transport.start();

        const onErrorSpy = vi.fn();
        transport.onerror = onErrorSpy;

        const errorEvent = new Event('error');
        // @ts-ignore - manually adding error property for test
        errorEvent.error = new Error('Connection error');

        mockWebSocket.onerror?.(errorEvent);

        expect(onErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should reject start if connection fails', async () => {
        // Mock failing WebSocket
        class FailingWebSocket {
            url: string;
            protocol: string;
            onopen: (() => void) | null = null;
            onclose: (() => void) | null = null;
            onerror: ((event: Event) => void) | null = null;
            onmessage: ((event: MessageEvent) => void) | null = null;
            readyState: number = 0;

            constructor(url: string | URL, protocol: string) {
                this.url = url.toString();
                this.protocol = protocol;

                setTimeout(() => {
                    const errorEvent = new Event('error');
                    // @ts-ignore
                    errorEvent.error = new Error('Connection failed');
                    this.onerror?.(errorEvent);
                }, 0);
            }
            send() {}
            close() {}
        }

        vi.stubGlobal('WebSocket', FailingWebSocket);

        transport = new WebSocketClientTransport(url);
        await expect(transport.start()).rejects.toThrow('Connection failed');
    });

    it('should close the connection', async () => {
        transport = new WebSocketClientTransport(url);
        await transport.start();

        const closeSpy = vi.spyOn(mockWebSocket, 'close');
        const onCloseSpy = vi.fn();
        transport.onclose = onCloseSpy;

        await transport.close();

        expect(closeSpy).toHaveBeenCalled();
        // Since our mock calls onclose synchronously in close(), verify it happened
        expect(onCloseSpy).toHaveBeenCalled();
    });

    it('should fail to send if not connected', async () => {
        transport = new WebSocketClientTransport(url);
        const message: JSONRPCMessage = {
            jsonrpc: '2.0',
            method: 'test',
            params: {},
        };
        await expect(transport.send(message)).rejects.toThrow('Not connected');
    });

    it('should handle invalid JSON messages', async () => {
        transport = new WebSocketClientTransport(url);
        await transport.start();

        const onErrorSpy = vi.fn();
        transport.onerror = onErrorSpy;

        const event = new MessageEvent('message', {
            data: 'invalid json',
        });
        mockWebSocket.onmessage?.(event);

        expect(onErrorSpy).toHaveBeenCalled();
    });

    it('should handle invalid Schema messages', async () => {
        transport = new WebSocketClientTransport(url);
        await transport.start();

        const onErrorSpy = vi.fn();
        transport.onerror = onErrorSpy;

        const event = new MessageEvent('message', {
            data: JSON.stringify({ invalid: 'schema' }),
        });
        mockWebSocket.onmessage?.(event);

        expect(onErrorSpy).toHaveBeenCalled();
    });
});
