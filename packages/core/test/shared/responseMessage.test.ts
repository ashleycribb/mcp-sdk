import { takeResult } from '../../src/shared/responseMessage.js';
import type { ResponseMessage } from '../../src/shared/responseMessage.js';
import { McpError, ErrorCode } from '../../src/types/types.js';
import type { Result, Task } from '../../src/types/types.js';

async function* generator<T>(...items: T[]) {
    for (const item of items) {
        yield item;
    }
}

const mockTask: Task = {
    taskId: 'test-task',
    status: 'working',
    ttl: null,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
};

describe('takeResult', () => {
    it('should return the result when a result message is yielded', async () => {
        const result: Result = { foo: 'bar' };
        const stream = generator<ResponseMessage<Result>>({
            type: 'result',
            result
        });

        const value = await takeResult(stream);
        expect(value).toBe(result);
    });

    it('should throw the error when an error message is yielded', async () => {
        const error = new McpError(ErrorCode.InternalError, 'Test error');
        const stream = generator<ResponseMessage<Result>>({
            type: 'error',
            error
        });

        await expect(takeResult(stream)).rejects.toThrow(error);
    });

    it('should ignore other messages (taskStatus, taskCreated) and return the result', async () => {
        const result: Result = { foo: 'bar' };
        const stream = generator<ResponseMessage<Result>>(
            {
                type: 'taskCreated',
                task: mockTask
            },
            {
                type: 'taskStatus',
                task: mockTask
            },
            {
                type: 'result',
                result
            }
        );

        const value = await takeResult(stream);
        expect(value).toBe(result);
    });

    it('should ignore other messages and throw the error', async () => {
        const error = new McpError(ErrorCode.InternalError, 'Test error');
        const stream = generator<ResponseMessage<Result>>(
            {
                type: 'taskCreated',
                task: mockTask
            },
            {
                type: 'error',
                error
            }
        );

        await expect(takeResult(stream)).rejects.toThrow(error);
    });

    it('should throw "No result in stream." if the stream finishes without result or error', async () => {
        const stream = generator<ResponseMessage<Result>>(
            {
                type: 'taskCreated',
                task: mockTask
            }
        );

        await expect(takeResult(stream)).rejects.toThrow('No result in stream.');
    });

    it('should propagate error if iterator throws', async () => {
        async function* throwingGenerator() {
            yield { type: 'taskCreated', task: mockTask } as const;
            throw new Error('Iterator error');
        }

        const stream = throwingGenerator();
        // Casting to any because typescript might complain about the generator type not matching exactly ResponseMessage<Result> due to the throw
        await expect(takeResult(stream as any)).rejects.toThrow('Iterator error');
    });
});
