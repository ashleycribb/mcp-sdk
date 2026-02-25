import { describe, it, expect } from 'vitest';
import { toArrayAsync, takeResult, type ResponseMessage, type TaskStatusMessage } from '../../src/shared/responseMessage.js';
import { McpError, ErrorCode, type Task } from '../../src/types/types.js';

describe('responseMessage', () => {
    describe('toArrayAsync', () => {
        it('should collect all values from an async generator into an array', async () => {
            async function* gen() {
                yield 1;
                yield 2;
                yield 3;
            }

            const result = await toArrayAsync(gen());
            expect(result).toEqual([1, 2, 3]);
        });

        it('should return an empty array for an empty generator', async () => {
            async function* gen() {
                // yield nothing
            }

            const result = await toArrayAsync(gen());
            expect(result).toEqual([]);
        });
    });

    describe('takeResult', () => {
        it('should return the result from a result message', async () => {
            async function* gen(): AsyncGenerator<ResponseMessage<string>> {
                yield { type: 'result', result: 'success' };
            }

            const result = await takeResult(gen());
            expect(result).toBe('success');
        });

        it('should skip other messages before the result', async () => {
            const task: Task = {
                taskId: '1',
                status: 'working',
                createdAt: '2023-01-01',
                lastUpdatedAt: '2023-01-01',
                pollInterval: 1000,
                ttl: null,
            };
            const statusMsg: TaskStatusMessage = { type: 'taskStatus', task };

            async function* gen(): AsyncGenerator<ResponseMessage<string>> {
                yield statusMsg;
                yield { type: 'result', result: 'success' };
            }

            const result = await takeResult(gen());
            expect(result).toBe('success');
        });

        it('should throw an error if an error message is encountered', async () => {
            const error = new McpError(ErrorCode.InternalError, 'fail');
            async function* gen(): AsyncGenerator<ResponseMessage<string>> {
                yield { type: 'error', error };
            }

            await expect(takeResult(gen())).rejects.toThrow(error);
        });

        it('should throw "No result in stream." if the stream ends without a result or error', async () => {
            const task: Task = {
                taskId: '1',
                status: 'working',
                createdAt: '2023-01-01',
                lastUpdatedAt: '2023-01-01',
                pollInterval: 1000,
                ttl: null,
            };
            const statusMsg: TaskStatusMessage = { type: 'taskStatus', task };

            async function* gen(): AsyncGenerator<ResponseMessage<string>> {
                yield statusMsg;
            }

            await expect(takeResult(gen())).rejects.toThrow('No result in stream.');
        });
    });
});
