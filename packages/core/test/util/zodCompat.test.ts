import { describe, it, expect } from 'vitest';
import * as z3 from 'zod/v3';
import * as z4mini from 'zod/v4-mini';
import {
  isZ4Schema,
  objectFromShape,
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
  describe('isZ4Schema', () => {
    it('should return true for v4 schemas', () => {
      const schema = z4mini.string();
      expect(isZ4Schema(schema)).toBe(true);
    });

    it('should return false for v3 schemas', () => {
      const schema = z3.string();
      expect(isZ4Schema(schema)).toBe(false);
    });
  });

  describe('objectFromShape', () => {
    it('should create a v4 object for empty shape', () => {
      const schema = objectFromShape({});
      expect(isZ4Schema(schema)).toBe(true);
      expect((schema as any)._zod.def.type).toBe('object');
    });

    it('should create a v4 object for v4 schemas', () => {
      const shape = {
        name: z4mini.string(),
        age: z4mini.number()
      };
      const schema = objectFromShape(shape);
      expect(isZ4Schema(schema)).toBe(true);
    });

    it('should create a v3 object for v3 schemas', () => {
      const shape = {
        name: z3.string(),
        age: z3.number()
      };
      const schema = objectFromShape(shape);
      expect(isZ4Schema(schema)).toBe(false);
    });

    it('should throw an error for mixed schemas', () => {
      const shape = {
        v3: z3.string(),
        v4: z4mini.string()
      };
      expect(() => objectFromShape(shape)).toThrow('Mixed Zod versions detected in object shape.');
    });
  });

  describe('safeParse', () => {
    it('should parse v4 schemas successfully', () => {
      const schema = z4mini.string();
      const result = safeParse(schema, 'test');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test');
      }
    });

    it('should return error for invalid v4 input', () => {
      const schema = z4mini.string();
      const result = safeParse(schema, 123);
      expect(result.success).toBe(false);
    });

    it('should parse v3 schemas successfully', () => {
      const schema = z3.string();
      const result = safeParse(schema, 'test');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test');
      }
    });

    it('should return error for invalid v3 input', () => {
      const schema = z3.string();
      const result = safeParse(schema, 123);
      expect(result.success).toBe(false);
    });
  });

  describe('safeParseAsync', () => {
    it('should async parse v4 schemas successfully', async () => {
      const schema = z4mini.string();
      const result = await safeParseAsync(schema, 'test');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test');
      }
    });

    it('should return error for invalid v4 input async', async () => {
      const schema = z4mini.string();
      const result = await safeParseAsync(schema, 123);
      expect(result.success).toBe(false);
    });

    it('should async parse v3 schemas successfully', async () => {
      const schema = z3.string();
      const result = await safeParseAsync(schema, 'test');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test');
      }
    });

    it('should return error for invalid v3 input async', async () => {
      const schema = z3.string();
      const result = await safeParseAsync(schema, 123);
      expect(result.success).toBe(false);
    });
  });

  describe('getObjectShape', () => {
    it('should return undefined for undefined schema', () => {
      expect(getObjectShape(undefined)).toBeUndefined();
    });

    it('should return shape for v4 object schema', () => {
      const shape = {
        name: z4mini.string(),
        age: z4mini.number()
      };
      const schema = z4mini.object(shape);
      const extractedShape = getObjectShape(schema);
      expect(extractedShape).toBeDefined();
      expect(Object.keys(extractedShape as object)).toEqual(['name', 'age']);
    });

    it('should return shape for v3 object schema', () => {
      const shape = {
        name: z3.string(),
        age: z3.number()
      };
      const schema = z3.object(shape);
      const extractedShape = getObjectShape(schema);
      expect(extractedShape).toBeDefined();
      expect(Object.keys(extractedShape as object)).toEqual(['name', 'age']);
    });

    it('should return undefined for non-object schemas', () => {
      const schema = z4mini.string();
      expect(getObjectShape(schema as any)).toBeUndefined();
    });
  });

  describe('normalizeObjectSchema', () => {
    it('should return undefined for undefined schema', () => {
      expect(normalizeObjectSchema(undefined)).toBeUndefined();
    });

    it('should convert raw v4 shape to v4 object schema', () => {
      const rawShape = { name: z4mini.string() };
      const schema = normalizeObjectSchema(rawShape);
      expect(isZ4Schema(schema as any)).toBe(true);
      expect((schema as any)._zod.def.type).toBe('object');
    });

    it('should convert raw v3 shape to v3 object schema', () => {
      const rawShape = { name: z3.string() };
      const schema = normalizeObjectSchema(rawShape);
      expect(isZ4Schema(schema as any)).toBe(false);
    });

    it('should return existing v4 object schema unchanged', () => {
      const schema = z4mini.object({ name: z4mini.string() });
      const normalized = normalizeObjectSchema(schema);
      expect(normalized).toBe(schema);
    });

    it('should return existing v3 object schema unchanged', () => {
      const schema = z3.object({ name: z3.string() });
      const normalized = normalizeObjectSchema(schema);
      expect(normalized).toBe(schema);
    });

    it('should return undefined for non-object schemas', () => {
      const schema = z4mini.string();
      expect(normalizeObjectSchema(schema)).toBeUndefined();
    });
  });

  describe('getParseErrorMessage', () => {
    it('should extract message from error object', () => {
      const error = { message: 'Something went wrong' };
      expect(getParseErrorMessage(error)).toBe('Something went wrong');
    });

    it('should extract message from Zod issues', () => {
      const error = { issues: [{ message: 'Invalid input' }] };
      expect(getParseErrorMessage(error)).toBe('Invalid input');
    });

    it('should fallback to stringify for generic objects', () => {
      const error = { foo: 'bar' };
      expect(getParseErrorMessage(error)).toBe('{"foo":"bar"}');
    });

    it('should fallback to String(error) if stringify fails (simulated)', () => {
        // Can't easily break JSON.stringify on a simple object without circular deps
        const circular: any = {};
        circular.self = circular;
        // String(circular) would be [object Object]
        expect(getParseErrorMessage(circular)).toBe('[object Object]');
    });

    it('should handle string errors', () => {
      expect(getParseErrorMessage('Error occurred')).toBe('Error occurred');
    });
  });

  describe('getSchemaDescription', () => {
    it('should return description for v4 schema', () => {
        // Zod v4 mini might not support .describe() directly depending on version,
        // but let's see if we can attach it manually or if it's supported
        // The implementation checks `schema.description`
        // In Mini, we might need to rely on how it stores it.
        // Assuming Mini doesn't have .describe, we might need to cast
        const schema = z4mini.string();
        (schema as any).description = 'A string';
        expect(getSchemaDescription(schema)).toBe('A string');
    });

    it('should return description for v3 schema', () => {
        const schema = z3.string().describe('A v3 string');
        expect(getSchemaDescription(schema)).toBe('A v3 string');
    });

    it('should return undefined if no description', () => {
        const schema = z4mini.string();
        expect(getSchemaDescription(schema)).toBeUndefined();
    });
  });

  describe('isSchemaOptional', () => {
    it('should return true for v4 optional schema', () => {
        // Zod v4-mini optional
        // The implementation checks `_zod.def.type === 'optional'`
        // Use z4mini.optional(schema) wrapper
        const schema = z4mini.optional(z4mini.string());
        expect(isSchemaOptional(schema)).toBe(true);
    });

    it('should return true for v3 optional schema', () => {
        const schema = z3.string().optional();
        expect(isSchemaOptional(schema)).toBe(true);
    });

    it('should return false for non-optional schemas', () => {
        expect(isSchemaOptional(z4mini.string())).toBe(false);
        expect(isSchemaOptional(z3.string())).toBe(false);
    });
  });

  describe('getLiteralValue', () => {
      it('should return value for v4 literal', () => {
          const schema = z4mini.literal('hello');
          expect(getLiteralValue(schema)).toBe('hello');
      });

      it('should return value for v3 literal', () => {
          const schema = z3.literal('world');
          expect(getLiteralValue(schema)).toBe('world');
      });

      it('should return undefined for non-literal schemas', () => {
          expect(getLiteralValue(z4mini.string())).toBeUndefined();
      });
  });
});
