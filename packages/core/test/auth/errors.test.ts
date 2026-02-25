import { describe, it, expect } from 'vitest';
import {
    OAuthError,
    InvalidRequestError,
    CustomOAuthError,
    OAUTH_ERRORS,
    InvalidClientError
} from '../../src/auth/errors.js';

describe('OAuthError', () => {
    class TestOAuthError extends OAuthError {
        static override errorCode = 'test_error';
    }

    it('should serialize to a response object correctly', () => {
        const error = new TestOAuthError('Something went wrong');
        const response = error.toResponseObject();

        expect(response).toEqual({
            error: 'test_error',
            error_description: 'Something went wrong'
        });
    });

    it('should include error_uri if provided', () => {
        const error = new TestOAuthError('Something went wrong', 'https://example.com/error');
        const response = error.toResponseObject();

        expect(response).toEqual({
            error: 'test_error',
            error_description: 'Something went wrong',
            error_uri: 'https://example.com/error'
        });
    });

    it('should use the correct error code for standard errors', () => {
        const error = new InvalidRequestError('Invalid request');
        expect(error.errorCode).toBe('invalid_request');
        expect(error.toResponseObject().error).toBe('invalid_request');
    });

    it('should handle CustomOAuthError correctly', () => {
        const error = new CustomOAuthError('custom_code', 'Custom message', 'https://custom.uri');
        expect(error.errorCode).toBe('custom_code');
        expect(error.toResponseObject()).toEqual({
            error: 'custom_code',
            error_description: 'Custom message',
            error_uri: 'https://custom.uri'
        });
    });
});

describe('OAUTH_ERRORS', () => {
    it('should contain all standard error classes', () => {
        expect(OAUTH_ERRORS['invalid_request']).toBe(InvalidRequestError);
        expect(OAUTH_ERRORS['invalid_client']).toBe(InvalidClientError);
    });
});
