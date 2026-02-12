import { getDisplayName } from '../../src/shared/metadataUtils.js';

describe('metadataUtils', () => {
    describe('getDisplayName', () => {
        it('should return title if present', () => {
            const metadata = {
                name: 'test-name',
                title: 'Test Title'
            };
            expect(getDisplayName(metadata)).toBe('Test Title');
        });

        it('should return annotations.title if title is missing but annotations.title is present', () => {
            const metadata = {
                name: 'test-name',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Annotation Title');
        });

        it('should return annotations.title if title is empty string', () => {
            const metadata = {
                name: 'test-name',
                title: '',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Annotation Title');
        });

        it('should return name if title and annotations.title are missing', () => {
            const metadata = {
                name: 'test-name'
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });

        it('should return name if title is undefined and annotations is missing', () => {
            const metadata = {
                name: 'test-name',
                title: undefined
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });

        it('should return name if title is empty and annotations is missing', () => {
             const metadata = {
                name: 'test-name',
                title: ''
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });

        it('should return name if annotations is present but title is missing inside it', () => {
            const metadata = {
                name: 'test-name',
                annotations: {
                    priority: 1
                }
            };
            expect(getDisplayName(metadata)).toBe('test-name');
        });

        it('should prioritize title over annotations.title', () => {
            const metadata = {
                name: 'test-name',
                title: 'Main Title',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Main Title');
        });

        it('should prioritize annotations.title over name', () => {
             const metadata = {
                name: 'test-name',
                annotations: {
                    title: 'Annotation Title'
                }
            };
            expect(getDisplayName(metadata)).toBe('Annotation Title');
        });
    });
});
