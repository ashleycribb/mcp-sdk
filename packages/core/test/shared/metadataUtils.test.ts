import { getDisplayName } from '../../src/shared/metadataUtils.js';

describe('metadataUtils', () => {
    describe('getDisplayName', () => {
        it('should return title if present and not empty', () => {
            const metadata = {
                name: 'test-name',
                title: 'Test Title'
            };
            expect(getDisplayName(metadata)).toBe('Test Title');
        });

        it('should return annotations.title if title is undefined', () => {
            const metadata = {
                name: 'test-name',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Annotation Title');
        });

        it('should return annotations.title if title is an empty string', () => {
            const metadata = {
                name: 'test-name',
                title: '',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Annotation Title');
        });

        it('should fall back to name if title and annotations.title are missing', () => {
            const metadata = {
                name: 'test-name'
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });

        it('should give precedence to title over annotations.title', () => {
            const metadata = {
                name: 'test-name',
                title: 'Primary Title',
                annotations: {
                    title: 'Secondary Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Primary Title');
        });

        it('should give precedence to annotations.title over name', () => {
            const metadata = {
                name: 'test-name',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Annotation Title');
        });

        it('should return name if title is empty and annotations.title is missing', () => {
            const metadata = {
                name: 'test-name',
                title: ''
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });

        it('should handle metadata with no annotations property', () => {
            const metadata = {
                name: 'test-name'
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });
    });
});
