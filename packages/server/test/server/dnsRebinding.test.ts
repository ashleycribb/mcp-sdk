import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebStandardStreamableHTTPServerTransport } from '../../src/server/streamableHttp.js';
import { McpServer } from '../../src/server/mcp.js';
import { randomUUID } from 'node:crypto';

describe('DNS Rebinding Protection', () => {
    let transport: WebStandardStreamableHTTPServerTransport;
    let mcpServer: McpServer;

    beforeEach(async () => {
        mcpServer = new McpServer({ name: 'test-server', version: '1.0.0' }, { capabilities: {} });
    });

    afterEach(async () => {
        if (transport) {
            await transport.close();
        }
    });

    it('should enforce allowedHosts by default (fix verification)', async () => {
        transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            allowedHosts: ['localhost']
        });

        await mcpServer.connect(transport);

        const request = new Request('http://evil.com/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
                'Host': 'evil.com'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'initialize',
                params: {
                    clientInfo: { name: 'test-client', version: '1.0' },
                    protocolVersion: '2024-11-05',
                    capabilities: {}
                },
                id: 'init-1'
            })
        });

        const response = await transport.handleRequest(request);

        // Fixed behavior: Request should fail with 403 Forbidden
        expect(response.status).toBe(403);
    });

    it('should allow requests with valid Host header', async () => {
        transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            allowedHosts: ['localhost']
        });

        await mcpServer.connect(transport);

        const request = new Request('http://localhost/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
                'Host': 'localhost'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'initialize',
                params: {
                    clientInfo: { name: 'test-client', version: '1.0' },
                    protocolVersion: '2024-11-05',
                    capabilities: {}
                },
                id: 'init-1'
            })
        });

        const response = await transport.handleRequest(request);

        expect(response.status).toBe(200);
    });

    it('should disable protection when explicitly set to false', async () => {
        transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            allowedHosts: ['localhost'],
            enableDnsRebindingProtection: false
        });

        await mcpServer.connect(transport);

        const request = new Request('http://evil.com/mcp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
                'Host': 'evil.com'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'initialize',
                params: {
                    clientInfo: { name: 'test-client', version: '1.0' },
                    protocolVersion: '2024-11-05',
                    capabilities: {}
                },
                id: 'init-1'
            })
        });

        const response = await transport.handleRequest(request);

        // Previous behavior restored
        expect(response.status).toBe(200);
    });
});
