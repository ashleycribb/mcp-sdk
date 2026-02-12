import { describe, expect, test } from 'vitest';
import { getDisplayName } from '../../src/shared/metadataUtils.js';

describe('metadataUtils', () => {
    describe('getDisplayName', () => {
        test('should return title if present', () => {
            const metadata = {
                name: 'test-name',
                title: 'Test Title'
            };
            expect(getDisplayName(metadata)).toBe('Test Title');
        });

        test('should return title if present even if annotations.title is present', () => {
            const metadata = {
                name: 'test-name',
                title: 'Test Title',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Test Title');
        });

        test('should fallback to annotations.title if title is undefined', () => {
            const metadata = {
                name: 'test-name',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Annotation Title');
        });

        test('should fallback to annotations.title if title is empty string', () => {
            const metadata = {
                name: 'test-name',
                title: '',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Annotation Title');
        });

        test('should fallback to name if title is missing and annotations is missing', () => {
            const metadata = {
                name: 'test-name'
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });

        test('should fallback to name if title is missing and annotations.title is missing', () => {
            const metadata = {
                name: 'test-name',
                annotations: {}
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });

        test('should fallback to name if title is missing and annotations.title is empty string', () => {
            const metadata = {
                name: 'test-name',
                annotations: {
                    title: ''
                }
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });

        test('should fallback to name if title is empty and annotations.title is missing', () => {
            const metadata = {
                name: 'test-name',
                title: ''
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });
    });
});
