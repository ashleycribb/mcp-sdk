import { describe, it, expect } from 'vitest';
import * as z3 from 'zod/v3';
import * as z4mini from 'zod/v4-mini';
import { toJsonSchemaCompat, getMethodLiteral, parseWithCompat } from '../../src/util/zodJsonSchemaCompat.js';

describe('zodJsonSchemaCompat', () => {
  describe('toJsonSchemaCompat', () => {
    describe('v3 schemas', () => {
      it('converts a simple string schema', () => {
        const schema = z3.string();
        const jsonSchema = toJsonSchemaCompat(schema);
        expect(jsonSchema).toMatchObject({ type: 'string' });
        expect(jsonSchema).toHaveProperty('$schema');
      });

      it('converts an object schema', () => {
        const schema = z3.object({
          name: z3.string(),
          age: z3.number().optional(),
        });
        const jsonSchema = toJsonSchemaCompat(schema);
        expect(jsonSchema).toMatchObject({
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['name'],
          additionalProperties: false,
        });
        expect(jsonSchema).toHaveProperty('$schema');
      });

      it('ignores target option (defaults to draft-07)', () => {
        const schema = z3.string();
        const jsonSchema = toJsonSchemaCompat(schema, { target: 'jsonSchema2019-09' });
        // Current implementation for v3 ignores the target option and defaults to draft-07
        expect(jsonSchema).toHaveProperty('$schema');
        expect(jsonSchema['$schema']).toContain('draft-07');
      });

      it('respects options (strictUnions)', () => {
        // Use a union of objects to ensure anyOf structure
        const schema = z3.union([
          z3.object({ a: z3.string() }),
          z3.object({ b: z3.number() })
        ]);
        // Default strictUnions is true in compat function
        const jsonSchema = toJsonSchemaCompat(schema, { strictUnions: false });
        // With strictUnions: false, it should use "anyOf"
        expect(jsonSchema).toHaveProperty('anyOf');
      });
    });

    describe('v4 (mini) schemas', () => {
      it('converts a simple string schema', () => {
        const schema = z4mini.string();
        const jsonSchema = toJsonSchemaCompat(schema);
        expect(jsonSchema).toMatchObject({ type: 'string' });
      });

      it('converts an object schema', () => {
        const schema = z4mini.object({
          name: z4mini.string(),
          age: z4mini.optional(z4mini.number()),
        });
        const jsonSchema = toJsonSchemaCompat(schema);

        // Mini might produce slightly different output structure or properties order
        expect(jsonSchema).toMatchObject({
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
          },
          required: ['name'],
        });
      });

      it('respects options (target)', () => {
        const schema = z4mini.string();
        // mapMiniTarget handles the mapping
        const jsonSchema = toJsonSchemaCompat(schema, { target: 'jsonSchema2019-09' });
        expect(jsonSchema).toHaveProperty('$schema');
        expect(jsonSchema['$schema']).toContain('2020-12');
      });
    });
  });

  describe('getMethodLiteral', () => {
    describe('v3 schemas', () => {
      it('extracts method literal', () => {
        const schema = z3.object({
          method: z3.literal('my/method'),
        });
        expect(getMethodLiteral(schema)).toBe('my/method');
      });

      it('throws if method property is missing', () => {
        const schema = z3.object({
          other: z3.string(),
        });
        expect(() => getMethodLiteral(schema)).toThrow('Schema is missing a method literal');
      });

      it('throws if method property is not a literal string', () => {
        const schema = z3.object({
          method: z3.string(),
        });
        expect(() => getMethodLiteral(schema)).toThrow('Schema method literal must be a string');
      });
    });

    describe('v4 schemas', () => {
      it('extracts method literal', () => {
        const schema = z4mini.object({
          method: z4mini.literal('my/method'),
        });
        expect(getMethodLiteral(schema)).toBe('my/method');
      });

      it('throws if method property is missing', () => {
        const schema = z4mini.object({
          other: z4mini.string(),
        });
        expect(() => getMethodLiteral(schema)).toThrow('Schema is missing a method literal');
      });

      it('throws if method property is not a literal string', () => {
        const schema = z4mini.object({
          method: z4mini.string(),
        });
        expect(() => getMethodLiteral(schema)).toThrow('Schema method literal must be a string');
      });
    });
  });

  describe('parseWithCompat', () => {
    describe('v3 schemas', () => {
      it('parses valid data', () => {
        const schema = z3.object({
          name: z3.string(),
        });
        const result = parseWithCompat(schema, { name: 'test' });
        expect(result).toEqual({ name: 'test' });
      });

      it('throws on invalid data', () => {
        const schema = z3.object({
          name: z3.string(),
        });
        expect(() => parseWithCompat(schema, { name: 123 })).toThrow();
      });
    });

    describe('v4 schemas', () => {
      it('parses valid data', () => {
        const schema = z4mini.object({
          name: z4mini.string(),
        });
        const result = parseWithCompat(schema, { name: 'test' });
        expect(result).toEqual({ name: 'test' });
      });

      it('throws on invalid data', () => {
        const schema = z4mini.object({
          name: z4mini.string(),
        });
        expect(() => parseWithCompat(schema, { name: 123 })).toThrow();
      });
    });
  });
});
