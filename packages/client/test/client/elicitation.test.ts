import { applyElicitationDefaults } from '../../src/client/client.js';
import { describe, it, expect } from 'vitest';
import type { JsonSchemaType } from '@modelcontextprotocol/core';

describe('applyElicitationDefaults', () => {
    it('should apply defaults to object properties', () => {
        const schema: JsonSchemaType = {
            type: 'object',
            properties: {
                foo: { type: 'string', default: 'bar' },
                baz: { type: 'number', default: 42 }
            }
        };
        const data: any = {};
        applyElicitationDefaults(schema, data);
        expect(data).toEqual({ foo: 'bar', baz: 42 });
    });

    it('should apply defaults recursively', () => {
        const schema: JsonSchemaType = {
            type: 'object',
            properties: {
                nested: {
                    type: 'object',
                    properties: {
                        deep: { type: 'boolean', default: true }
                    }
                }
            }
        };
        const data: any = { nested: {} };
        applyElicitationDefaults(schema, data);
        expect(data).toEqual({ nested: { deep: true } });
    });

    it('should not overwrite existing values', () => {
        const schema: JsonSchemaType = {
            type: 'object',
            properties: {
                foo: { type: 'string', default: 'default' }
            }
        };
        const data: any = { foo: 'existing' };
        applyElicitationDefaults(schema, data);
        expect(data).toEqual({ foo: 'existing' });
    });

    it('should apply defaults from nested objects in anyOf', () => {
        const schema: JsonSchemaType = {
            type: 'object',
            properties: {
                someData: {
                    anyOf: [
                        {
                            type: 'object',
                            properties: {
                                fieldA: { type: 'string', default: 'defaultA' }
                            }
                        }
                    ]
                }
            }
        };
        const data: any = { someData: {} };
        applyElicitationDefaults(schema, data);
        expect(data.someData.fieldA).toBe('defaultA');
    });

    it('should apply defaults from nested objects in oneOf', () => {
        const schema: JsonSchemaType = {
            type: 'object',
            properties: {
                someData: {
                    oneOf: [
                        {
                            type: 'object',
                            properties: {
                                fieldB: { type: 'string', default: 'defaultB' }
                            }
                        }
                    ]
                }
            }
        };
        const data: any = { someData: {} };
        applyElicitationDefaults(schema, data);
        expect(data.someData.fieldB).toBe('defaultB');
    });

    it('should handle mixed anyOf and oneOf', () => {
        const schema: JsonSchemaType = {
            type: 'object',
            properties: {
                mixed: {
                    anyOf: [
                        {
                            type: 'object',
                            properties: {
                                fieldA: { type: 'string', default: 'defaultA' }
                            }
                        }
                    ],
                    oneOf: [
                        {
                            type: 'object',
                            properties: {
                                fieldB: { type: 'string', default: 'defaultB' }
                            }
                        }
                    ]
                }
            }
        };
        const data: any = { mixed: {} };
        applyElicitationDefaults(schema, data);
        expect(data.mixed.fieldA).toBe('defaultA');
        expect(data.mixed.fieldB).toBe('defaultB');
    });

    it('should skip boolean sub-schemas', () => {
        const schema: JsonSchemaType = {
            type: 'object',
            properties: {
                test: {
                    anyOf: [
                        true, // Boolean schema
                        {
                            type: 'object',
                            properties: {
                                field: { type: 'string', default: 'value' }
                            }
                        }
                    ]
                }
            }
        };
        const data: any = { test: {} };
        applyElicitationDefaults(schema, data);
        expect(data.test.field).toBe('value');
    });

    it('should handle missing anyOf/oneOf gracefully', () => {
        const schema: JsonSchemaType = {
            type: 'object',
            properties: {
                test: { type: 'string' }
            }
        };
        const data: any = { test: 'value' };
        // Should not throw
        applyElicitationDefaults(schema, data);
        expect(data).toEqual({ test: 'value' });
    });
});
