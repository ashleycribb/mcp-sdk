import { describe, expect, test } from 'vitest';
import * as z3 from 'zod/v3';
import * as z4mini from 'zod/v4-mini';
import * as zodCompat from '../src/util/zodCompat.js';

describe('zodCompat', () => {
    // --- Runtime detection ---
    describe('isZ4Schema', () => {
        test('should return false for Zod v3 schemas', () => {
            const schema = z3.string();
            expect(zodCompat.isZ4Schema(schema)).toBe(false);
        });

        test('should return true for Zod v4 schemas', () => {
            const schema = z4mini.string();
            expect(zodCompat.isZ4Schema(schema)).toBe(true);
        });
    });

    // --- Schema construction ---
    describe('objectFromShape', () => {
        test('should create a v3 object from v3 shape', () => {
            const shape = {
                name: z3.string(),
                age: z3.number()
            };
            const schema = zodCompat.objectFromShape(shape);
            expect(zodCompat.isZ4Schema(schema)).toBe(false);
            expect((schema as z3.ZodObject<any>).shape).toEqual(shape);
        });

        test('should create a v4 object from v4 shape', () => {
            const shape = {
                name: z4mini.string(),
                age: z4mini.number()
            };
            const schema = zodCompat.objectFromShape(shape);
            expect(zodCompat.isZ4Schema(schema)).toBe(true);
        });

        test('should create a v4 object from empty shape', () => {
            const schema = zodCompat.objectFromShape({});
            expect(zodCompat.isZ4Schema(schema)).toBe(true);
        });

        test('should throw error for mixed shapes', () => {
            const shape = {
                v3: z3.string(),
                v4: z4mini.string()
            };
            expect(() => zodCompat.objectFromShape(shape)).toThrow('Mixed Zod versions detected in object shape.');
        });
    });

    // --- Unified parsing ---
    describe('safeParse', () => {
        test('should parse correctly with v3 schema', () => {
            const schema = z3.string();
            const result = zodCompat.safeParse(schema, 'hello');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('hello');
            }
        });

        test('should return error with v3 schema', () => {
            const schema = z3.string();
            const result = zodCompat.safeParse(schema, 123);
            expect(result.success).toBe(false);
        });

        test('should parse correctly with v4 schema', () => {
            const schema = z4mini.string();
            const result = zodCompat.safeParse(schema, 'hello');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('hello');
            }
        });

        test('should return error with v4 schema', () => {
            const schema = z4mini.string();
            const result = zodCompat.safeParse(schema, 123);
            expect(result.success).toBe(false);
        });
    });

    describe('safeParseAsync', () => {
        test('should parse correctly with v3 schema', async () => {
            const schema = z3.string();
            const result = await zodCompat.safeParseAsync(schema, 'hello');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('hello');
            }
        });

        test('should parse correctly with v4 schema', async () => {
            const schema = z4mini.string();
            const result = await zodCompat.safeParseAsync(schema, 'hello');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('hello');
            }
        });
    });

    // --- Shape extraction ---
    describe('getObjectShape', () => {
        test('should extract shape from v3 object schema', () => {
            const shape = { name: z3.string() };
            const schema = z3.object(shape);
            const extracted = zodCompat.getObjectShape(schema);
            expect(extracted).toEqual(shape);
        });

        test('should extract shape from v4 object schema', () => {
            const shape = { name: z4mini.string() };
            const schema = z4mini.object(shape);
            const extracted = zodCompat.getObjectShape(schema);
            // v4 shape extraction might need checking keys/values
            expect(extracted).toBeDefined();
            expect(extracted?.name).toBeDefined();
        });

        test('should return undefined for undefined schema', () => {
            expect(zodCompat.getObjectShape(undefined)).toBeUndefined();
        });
    });

    // --- Schema normalization ---
    describe('normalizeObjectSchema', () => {
        test('should normalize v3 raw shape', () => {
            const shape = { name: z3.string() };
            const schema = zodCompat.normalizeObjectSchema(shape);
            expect(schema).toBeDefined();
            expect(zodCompat.isZ4Schema(schema as any)).toBe(false);
        });

        test('should normalize v4 raw shape', () => {
            const shape = { name: z4mini.string() };
            const schema = zodCompat.normalizeObjectSchema(shape);
            expect(schema).toBeDefined();
            expect(zodCompat.isZ4Schema(schema as any)).toBe(true);
        });

        test('should return existing v3 object schema', () => {
            const schema = z3.object({ name: z3.string() });
            const normalized = zodCompat.normalizeObjectSchema(schema);
            expect(normalized).toBe(schema);
        });

        test('should return existing v4 object schema', () => {
            const schema = z4mini.object({ name: z4mini.string() });
            const normalized = zodCompat.normalizeObjectSchema(schema);
            expect(normalized).toBe(schema);
        });

        test('should return undefined for invalid input', () => {
             expect(zodCompat.normalizeObjectSchema(null as any)).toBeUndefined();
             expect(zodCompat.normalizeObjectSchema(undefined)).toBeUndefined();
             // v3 string schema is not an object schema
             expect(zodCompat.normalizeObjectSchema(z3.string())).toBeUndefined();
        });
    });

    // --- Error message extraction ---
    describe('getParseErrorMessage', () => {
        test('should extract message from Error object', () => {
            const error = new Error('test error');
            expect(zodCompat.getParseErrorMessage(error)).toBe('test error');
        });

        test('should extract message from Zod-like error (issues array)', () => {
            const error = { issues: [{ message: 'zod error' }] };
            expect(zodCompat.getParseErrorMessage(error)).toBe('zod error');
        });

        test('should use JSON stringify for other objects', () => {
            const error = { foo: 'bar' };
            expect(zodCompat.getParseErrorMessage(error)).toBe('{"foo":"bar"}');
        });

        test('should return string for primitive values', () => {
            expect(zodCompat.getParseErrorMessage('string error')).toBe('string error');
            expect(zodCompat.getParseErrorMessage(123)).toBe('123');
        });
    });

    // --- Schema metadata access ---
    describe('getSchemaDescription', () => {
        test('should get description from v3 schema', () => {
            const schema = z3.string().describe('v3 description');
            expect(zodCompat.getSchemaDescription(schema)).toBe('v3 description');
        });

        test('should get description from v4 schema', () => {
            const schema = z4mini.string();
            // Manually add description as z4mini doesn't have .describe() but zodCompat checks for the property
            Object.defineProperty(schema, 'description', { value: 'v4 description', configurable: true });
            expect(zodCompat.getSchemaDescription(schema)).toBe('v4 description');
        });

        test('should return undefined if no description', () => {
            expect(zodCompat.getSchemaDescription(z3.string())).toBeUndefined();
        });
    });

    describe('isSchemaOptional', () => {
        test('should identify v3 optional schema', () => {
            const schema = z3.string().optional();
            expect(zodCompat.isSchemaOptional(schema)).toBe(true);
        });

        test('should identify v3 non-optional schema', () => {
            const schema = z3.string();
            expect(zodCompat.isSchemaOptional(schema)).toBe(false);
        });

        test('should identify v4 optional schema', () => {
            const schema = z4mini.optional(z4mini.string());
            expect(zodCompat.isSchemaOptional(schema)).toBe(true);
        });

        test('should identify v4 non-optional schema', () => {
            const schema = z4mini.string();
            expect(zodCompat.isSchemaOptional(schema)).toBe(false);
        });
    });

    describe('getLiteralValue', () => {
        test('should get value from v3 literal', () => {
            const schema = z3.literal('v3value');
            expect(zodCompat.getLiteralValue(schema)).toBe('v3value');
        });

        test('should get value from v4 literal', () => {
            const schema = z4mini.literal('v4value');
            expect(zodCompat.getLiteralValue(schema)).toBe('v4value');
        });

        test('should return undefined for non-literal', () => {
            expect(zodCompat.getLiteralValue(z3.string())).toBeUndefined();
        });
    });
});
