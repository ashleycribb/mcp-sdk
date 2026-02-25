import { vi, describe, it, expect } from 'vitest';
import express from 'express';
import { createMcpExpressApp } from '../src/express.js';

// We need to mock express to spy on the json method
// Since express is a function with properties, spying on the property should work
// providing the module mocks work as expected in this setup.

vi.mock('express', async () => {
    const actual = await vi.importActual<typeof import('express')>('express');
    const app = {
        use: vi.fn(),
        get: vi.fn(),
        post: vi.fn()
    };
    const expressFn = vi.fn(() => app);
    // Copy properties from actual express
    Object.assign(expressFn, actual);
    // Mock json method specifically
    (expressFn as any).json = vi.fn(() => (req: any, res: any, next: any) => next());
    return {
        default: expressFn
    };
});

describe('Security Fixes', () => {
    it('should configure express.json with a 10mb limit', () => {
        createMcpExpressApp();
        expect(express.json).toHaveBeenCalledWith({ limit: '10mb' });
    });
});
