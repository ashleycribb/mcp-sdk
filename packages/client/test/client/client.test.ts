import { describe, expect, it } from 'vitest';
import { getSupportedElicitationModes } from '../../src/client/client.js';

describe('getSupportedElicitationModes', () => {
    it('returns false for both modes when capabilities are undefined', () => {
        expect(getSupportedElicitationModes(undefined)).toEqual({
            supportsFormMode: false,
            supportsUrlMode: false
        });
    });

    it('returns supportsFormMode=true for empty capabilities (backwards compatibility)', () => {
        expect(getSupportedElicitationModes({})).toEqual({
            supportsFormMode: true,
            supportsUrlMode: false
        });
    });

    it('returns supportsFormMode=true when explicitly declared', () => {
        expect(getSupportedElicitationModes({ form: {} })).toEqual({
            supportsFormMode: true,
            supportsUrlMode: false
        });
    });

    it('returns supportsUrlMode=true when explicitly declared', () => {
        expect(getSupportedElicitationModes({ url: {} })).toEqual({
            supportsFormMode: false,
            supportsUrlMode: true
        });
    });

    it('returns both true when both are declared', () => {
        expect(getSupportedElicitationModes({ form: {}, url: {} })).toEqual({
            supportsFormMode: true,
            supportsUrlMode: true
        });
    });

    it('returns supportsFormMode=true when form is explicitly declared even if url is undefined', () => {
        expect(getSupportedElicitationModes({ form: {}, url: undefined })).toEqual({
            supportsFormMode: true,
            supportsUrlMode: false
        });
    });

    it('returns supportsUrlMode=true when url is explicitly declared even if form is undefined', () => {
        expect(getSupportedElicitationModes({ form: undefined, url: {} })).toEqual({
            supportsFormMode: false,
            supportsUrlMode: true
        });
    });
});
