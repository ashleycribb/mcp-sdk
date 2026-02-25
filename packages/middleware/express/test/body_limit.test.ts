import { vi, describe, it, expect } from 'vitest';
import express from 'express';
import { createMcpExpressApp } from '../src/express.js';

vi.mock('express', () => {
    const jsonSpy = vi.fn();
    const useSpy = vi.fn();

    const expressFn = vi.fn(() => ({
        use: useSpy
    }));

    // @ts-ignore
    expressFn.json = jsonSpy;

    return {
        default: expressFn
    };
});

describe('createMcpExpressApp body limit', () => {
    it('should configure express.json with 10mb limit', () => {
        createMcpExpressApp();
        expect(express.json).toHaveBeenCalledWith({ limit: '10mb' });
    });
});
