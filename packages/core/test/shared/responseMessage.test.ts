import { toArrayAsync } from '../../src/shared/responseMessage.js';

describe('toArrayAsync', () => {
    async function* numberGenerator(count: number) {
        for (let i = 0; i < count; i++) {
            yield i;
        }
    }

    async function* errorGenerator() {
        yield 1;
        throw new Error('Test error');
    }

    test('collects all values from generator', async () => {
        const result = await toArrayAsync(numberGenerator(3));
        expect(result).toEqual([0, 1, 2]);
    });

    test('handles empty generator', async () => {
        const result = await toArrayAsync(numberGenerator(0));
        expect(result).toEqual([]);
    });

    test('propagates errors', async () => {
        await expect(toArrayAsync(errorGenerator())).rejects.toThrow('Test error');
    });
});
