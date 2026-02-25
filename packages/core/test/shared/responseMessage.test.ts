import { describe, expect, test } from 'vitest';
import { toArrayAsync, takeResult } from '../../src/shared/responseMessage.js';
import type { ResponseMessage } from '../../src/shared/responseMessage.js';
import { type Result, McpError } from '../../src/types/types.js';

describe('toArrayAsync', () => {
  test('should accumulate values from async generator', async () => {
    async function* gen() {
      yield 1;
      yield 2;
      yield 3;
    }

    const result = await toArrayAsync(gen());
    expect(result).toEqual([1, 2, 3]);
  });

  test('should handle empty generator', async () => {
    async function* gen() {
      // Empty
    }

    const result = await toArrayAsync(gen());
    expect(result).toEqual([]);
  });

  test('should propagate error from generator', async () => {
    async function* gen() {
      yield 1;
      throw new Error('Test error');
    }

    await expect(toArrayAsync(gen())).rejects.toThrow('Test error');
  });
});

describe('takeResult', () => {
  test('should return result from stream', async () => {
    const expectedResult: Result = { content: 'test' };
    async function* gen(): AsyncGenerator<ResponseMessage<Result>> {
      yield { type: 'result', result: expectedResult };
    }

    const result = await takeResult(gen());
    expect(result).toEqual(expectedResult);
  });

  test('should throw error from stream', async () => {
    const error = new McpError(123, 'Test error');
    async function* gen(): AsyncGenerator<ResponseMessage<Result>> {
      yield { type: 'error', error };
    }

    await expect(takeResult(gen())).rejects.toThrow(error);
  });

  test('should ignore other messages before result', async () => {
    const expectedResult: Result = { content: 'test' };
    async function* gen(): AsyncGenerator<ResponseMessage<Result>> {
      yield { type: 'taskStatus', task: { taskId: '1', status: 'working', ttl: null, createdAt: '', lastUpdatedAt: '', pollInterval: 0 } };
      yield { type: 'taskCreated', task: { taskId: '1', status: 'working', ttl: null, createdAt: '', lastUpdatedAt: '', pollInterval: 0 } };
      yield { type: 'result', result: expectedResult };
    }

    const result = await takeResult(gen());
    expect(result).toEqual(expectedResult);
  });

  test('should throw if no result in stream', async () => {
    async function* gen(): AsyncGenerator<ResponseMessage<Result>> {
      yield { type: 'taskStatus', task: { taskId: '1', status: 'working', ttl: null, createdAt: '', lastUpdatedAt: '', pollInterval: 0 } };
    }

    await expect(takeResult(gen())).rejects.toThrow('No result in stream.');
  });
});
