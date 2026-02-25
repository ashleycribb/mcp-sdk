import { expect, describe, it } from 'vitest';
import { getSupportedElicitationModes } from '../../src/client/client.js';

describe('getSupportedElicitationModes', () => {
    it('returns false for both modes when capabilities are undefined', () => {
        expect(getSupportedElicitationModes(undefined)).toEqual({
            supportsFormMode: false,
            supportsUrlMode: false
        });
    });

    it('defaults to form mode when capabilities object is empty (backwards compatibility)', () => {
        expect(getSupportedElicitationModes({})).toEqual({
            supportsFormMode: true,
            supportsUrlMode: false
        });
    });

    it('supports form mode when explicitly declared', () => {
        expect(getSupportedElicitationModes({ form: {} })).toEqual({
            supportsFormMode: true,
            supportsUrlMode: false
        });
    });

    it('supports url mode when explicitly declared', () => {
        expect(getSupportedElicitationModes({ url: {} })).toEqual({
            supportsFormMode: false,
            supportsUrlMode: true
        });
    });

    it('supports both modes when both are declared', () => {
        expect(getSupportedElicitationModes({ form: {}, url: {} })).toEqual({
            supportsFormMode: true,
            supportsUrlMode: true
        });
    });

    it('supports form mode when declared alongside url mode', () => {
         // This is covered by the "both modes" test, but just to be explicit about combinations
         expect(getSupportedElicitationModes({ form: {}, url: {} })).toEqual({
            supportsFormMode: true,
            supportsUrlMode: true
        });
    });
});
