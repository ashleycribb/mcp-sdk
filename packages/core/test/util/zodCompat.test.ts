import { describe, it, expect } from 'vitest';
import * as z3 from 'zod/v3';
import * as z4mini from 'zod/v4-mini';
import {
    objectFromShape,
    isZ4Schema,
    safeParse,
    safeParseAsync,
    getObjectShape,
    normalizeObjectSchema,
    getParseErrorMessage,
    getSchemaDescription,
    isSchemaOptional,
    getLiteralValue
} from '../../src/util/zodCompat.js';

describe('zodCompat', () => {
    describe('objectFromShape', () => {
        it('should create a z4 object from an empty shape', () => {
            const schema = objectFromShape({});
            // Default to v4 Mini for empty shape
            expect(isZ4Schema(schema)).toBe(true);
            const result = schema.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should create a z4 object from z4 shape', () => {
            const shape = {
                foo: z4mini.string()
            };
            const schema = objectFromShape(shape);
            expect(isZ4Schema(schema)).toBe(true);

            const result = schema.safeParse({ foo: 'bar' });
            expect(result.success).toBe(true);
        });

        it('should create a z3 object from z3 shape', () => {
            const shape = {
                foo: z3.string()
            };
            const schema = objectFromShape(shape);
            expect(isZ4Schema(schema)).toBe(false);

            const result = schema.safeParse({ foo: 'bar' });
            expect(result.success).toBe(true);
        });

        it('should throw error for mixed versions', () => {
            const shape = {
                v3: z3.string(),
                v4: z4mini.string()
            };
            expect(() => objectFromShape(shape)).toThrow('Mixed Zod versions detected in object shape.');
        });
    });

    describe('safeParse', () => {
        it('should safeParse v4 schema successfully', () => {
            const schema = z4mini.object({ val: z4mini.string() });
            const result = safeParse(schema, { val: 'test' });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({ val: 'test' });
            }
        });

        it('should safeParse v4 schema with error', () => {
            const schema = z4mini.object({ val: z4mini.string() });
            const result = safeParse(schema, { val: 123 });
            expect(result.success).toBe(false);
        });

        it('should safeParse v3 schema successfully', () => {
            const schema = z3.object({ val: z3.string() });
            const result = safeParse(schema, { val: 'test' });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({ val: 'test' });
            }
        });

        it('should safeParse v3 schema with error', () => {
            const schema = z3.object({ val: z3.string() });
            const result = safeParse(schema, { val: 123 });
            expect(result.success).toBe(false);
        });
    });

    describe('safeParseAsync', () => {
        it('should safeParseAsync v4 schema successfully', async () => {
            const schema = z4mini.object({ val: z4mini.string() });
            const result = await safeParseAsync(schema, { val: 'test' });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({ val: 'test' });
            }
        });

        it('should safeParseAsync v4 schema with error', async () => {
            const schema = z4mini.object({ val: z4mini.string() });
            const result = await safeParseAsync(schema, { val: 123 });
            expect(result.success).toBe(false);
        });

        it('should safeParseAsync v3 schema successfully', async () => {
            const schema = z3.object({ val: z3.string() });
            const result = await safeParseAsync(schema, { val: 'test' });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({ val: 'test' });
            }
        });

        it('should safeParseAsync v3 schema with error', async () => {
            const schema = z3.object({ val: z3.string() });
            const result = await safeParseAsync(schema, { val: 123 });
            expect(result.success).toBe(false);
        });
    });

    describe('getObjectShape', () => {
        it('should return undefined for undefined schema', () => {
            expect(getObjectShape(undefined)).toBeUndefined();
        });

        it('should return shape for v4 object schema', () => {
            const schema = z4mini.object({ foo: z4mini.string() });
            const shape = getObjectShape(schema);
            expect(shape).toBeDefined();
            expect(shape?.foo).toBeDefined();
            expect(isZ4Schema(shape!.foo)).toBe(true);
        });

        it('should return shape for v3 object schema', () => {
            const schema = z3.object({ foo: z3.string() });
            const shape = getObjectShape(schema);
            expect(shape).toBeDefined();
            expect(shape?.foo).toBeDefined();
            expect(isZ4Schema(shape!.foo)).toBe(false);
        });

        // Test for handling function-based shapes if applicable
        // Note: z3.object() can have lazy shapes in some contexts, or internal implementations might use it.
        // We can mock the internal structure to test the function handling path.
        it('should handle function-based shape (mocked v3)', () => {
            const mockSchema = {
                shape: () => ({ foo: z3.string() })
            } as any;
            const shape = getObjectShape(mockSchema);
            expect(shape).toBeDefined();
            expect(shape?.foo).toBeDefined();
        });

         it('should return undefined if shape function throws', () => {
            const mockSchema = {
                shape: () => { throw new Error('fail'); }
            } as any;
            expect(getObjectShape(mockSchema)).toBeUndefined();
        });
    });

    describe('normalizeObjectSchema', () => {
        it('should return undefined for undefined input', () => {
            expect(normalizeObjectSchema(undefined)).toBeUndefined();
        });

        it('should return undefined for non-object input (e.g. string)', () => {
             // @ts-ignore
            expect(normalizeObjectSchema('string')).toBeUndefined();
        });

        it('should normalize v4 raw shape to v4 object schema', () => {
            const shape = { foo: z4mini.string() };
            const schema = normalizeObjectSchema(shape);
            expect(schema).toBeDefined();
            expect(isZ4Schema(schema!)).toBe(true);
            const extracted = getObjectShape(schema!);
            expect(extracted).toBeDefined();
            expect(extracted?.foo).toBeDefined();
        });

        it('should normalize v3 raw shape to v3 object schema', () => {
            const shape = { foo: z3.string() };
            const schema = normalizeObjectSchema(shape);
            expect(schema).toBeDefined();
            expect(isZ4Schema(schema!)).toBe(false);
            const extracted = getObjectShape(schema!);
            expect(extracted).toBeDefined();
            expect(extracted?.foo).toBeDefined();
        });

        it('should return v4 object schema as is', () => {
            const schema = z4mini.object({ foo: z4mini.string() });
            const normalized = normalizeObjectSchema(schema);
            expect(normalized).toBe(schema);
        });

        it('should return v3 object schema as is', () => {
            const schema = z3.object({ foo: z3.string() });
            const normalized = normalizeObjectSchema(schema);
            expect(normalized).toBe(schema);
        });

         it('should return undefined for non-schema object that looks like raw shape but empty values', () => {
             // An empty object {} is treated as v4 mini object({}) by objectFromShape if passed directly,
             // but normalizeObjectSchema checks values.
             // If values is empty, normalizeObjectSchema returns undefined because it fails the check `values.length > 0`
             // Wait, let's check implementation.
             // implementation:
             /*
             if (
                values.length > 0 &&
                values.every(...)
            )
             */
             // So empty object {} returns undefined.
            expect(normalizeObjectSchema({})).toBeUndefined();
        });
    });

    describe('getParseErrorMessage', () => {
        it('should extract message from Error object', () => {
            const error = new Error('test error');
            expect(getParseErrorMessage(error)).toBe('test error');
        });

        it('should extract message from object with message property', () => {
            const error = { message: 'custom message' };
            expect(getParseErrorMessage(error)).toBe('custom message');
        });

        it('should extract message from Zod-like issues array', () => {
            const error = { issues: [{ message: 'issue message' }] };
            expect(getParseErrorMessage(error)).toBe('issue message');
        });

        it('should stringify unknown object', () => {
            const error = { foo: 'bar' };
            expect(getParseErrorMessage(error)).toBe('{"foo":"bar"}');
        });

        it('should return string representation if not object', () => {
            expect(getParseErrorMessage('string error')).toBe('string error');
            expect(getParseErrorMessage(123)).toBe('123');
        });
    });

    describe('getSchemaDescription', () => {
        it('should get description from v4 schema', () => {
            // z4-mini doesn't have .describe(), but might expose description in other ways or we can set it manually if possible
            // The implementation checks (schema as { description?: string }).description
            // Let's see if we can attach it
            const schema = z4mini.string();
            (schema as any).description = 'v4 desc';
            expect(getSchemaDescription(schema)).toBe('v4 desc');
        });

        it('should get description from v3 schema', () => {
            const schema = z3.string().describe('v3 desc');
            expect(getSchemaDescription(schema)).toBe('v3 desc');
        });

        it('should return undefined if no description', () => {
            const schema = z3.string();
            expect(getSchemaDescription(schema)).toBeUndefined();
        });
    });

    describe('isSchemaOptional', () => {
        it('should detect v4 optional schema', () => {
            const schema = z4mini.optional(z4mini.string());
            expect(isSchemaOptional(schema)).toBe(true);
        });

        it('should detect v4 non-optional schema', () => {
            const schema = z4mini.string();
            expect(isSchemaOptional(schema)).toBe(false);
        });

        it('should detect v3 optional schema', () => {
            const schema = z3.string().optional();
            expect(isSchemaOptional(schema)).toBe(true);
        });

        it('should detect v3 non-optional schema', () => {
            const schema = z3.string();
            expect(isSchemaOptional(schema)).toBe(false);
        });
    });

    describe('getLiteralValue', () => {
        it('should get value from v4 literal', () => {
            const schema = z4mini.literal('v4val');
            expect(getLiteralValue(schema)).toBe('v4val');
        });

        it('should get value from v3 literal', () => {
            const schema = z3.literal('v3val');
            expect(getLiteralValue(schema)).toBe('v3val');
        });

        it('should return undefined for non-literal schema', () => {
            const schema = z3.string();
            expect(getLiteralValue(schema)).toBeUndefined();
        });
    });
});
