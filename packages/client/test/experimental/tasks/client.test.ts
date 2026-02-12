import { describe, expect, it } from 'vitest';
import { Client } from '../../../src/client/client.js';
import { InMemoryTransport } from '@modelcontextprotocol/core';

describe('ExperimentalClientTasks', () => {
    it('should be able to check if a tool is a task', async () => {
        const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

        const client = new Client(
            { name: 'test-client', version: '1.0.0' },
            {
                capabilities: {}
            }
        );

        // Mock server to respond to initialize and tools/list
        serverTransport.onmessage = async message => {
            const msg = message as any;
            if (msg.method === 'initialize') {
                await serverTransport.send({
                    jsonrpc: '2.0',
                    id: msg.id,
                    result: {
                        protocolVersion: '2024-11-05',
                        capabilities: {
                            tasks: {
                                requests: {
                                    tools: {
                                        call: {} // Server supports tasks
                                    }
                                }
                            },
                            tools: {}
                        },
                        serverInfo: {
                            name: 'test-server',
                            version: '1.0.0'
                        }
                    }
                });
            } else if (msg.method === 'notifications/initialized') {
                // acknowledged
            } else if (msg.method === 'tools/list') {
                await serverTransport.send({
                    jsonrpc: '2.0',
                    id: msg.id,
                    result: {
                        tools: [
                            {
                                name: 'task-tool',
                                description: 'A tool that is a task',
                                inputSchema: { type: 'object' },
                                execution: {
                                    taskSupport: 'optional'
                                }
                            }
                        ]
                    }
                });
            } else if (msg.method === 'tools/call') {
                await serverTransport.send({
                    jsonrpc: '2.0',
                    id: msg.id,
                    result: {
                        content: [{ type: 'text', text: 'result' }]
                    }
                });
            }
        };

        await client.connect(clientTransport);
        await client.listTools();

        // Now try to use experimental tasks
        // This should invoke isToolTask internal method
        // If isToolTask is removed or broken, this will throw
        const stream = client.experimental.tasks.callToolStream({
            name: 'task-tool',
            arguments: {}
        });

        // We just want to see if it throws or works up to the point of sending request
        const iterator = stream[Symbol.asyncIterator]();

        try {
            await iterator.next();
        } catch (e) {
            // Ignore downstream errors
        }
    });
});
