import { describe, expect, it } from 'vitest';
import * as z3 from 'zod/v3';
import * as z4mini from 'zod/v4-mini';
import { isZ4Schema, objectFromShape } from '../../src/util/zodCompat.js';

describe('objectFromShape', () => {
  it('should return a v4 object for empty shape', () => {
    const result = objectFromShape({});
    expect(isZ4Schema(result)).toBe(true);
  });

  it('should return a v4 object for v4-only shape', () => {
    const shape = {
      foo: z4mini.string(),
      bar: z4mini.number(),
    };
    const result = objectFromShape(shape);
    expect(isZ4Schema(result)).toBe(true);

    // Verify functionality
    const parsed = result.safeParse({ foo: 'hello', bar: 123 });
    expect(parsed.success).toBe(true);
  });

  it('should return a v3 object for v3-only shape', () => {
    const shape = {
      foo: z3.string(),
      bar: z3.number(),
    };
    const result = objectFromShape(shape);
    expect(isZ4Schema(result)).toBe(false);

    // Verify functionality
    const parsed = result.safeParse({ foo: 'hello', bar: 123 });
    expect(parsed.success).toBe(true);
  });

  it('should throw error for mixed v3 and v4 shape', () => {
    const shape = {
      foo: z3.string(),
      bar: z4mini.number(),
    };
    expect(() => objectFromShape(shape)).toThrow(
      'Mixed Zod versions detected in object shape.'
    );
  });
});
