import { describe, expect, test } from 'vitest';
import {
    AccessDeniedError,
    CustomOAuthError,
    InsufficientScopeError,
    InvalidClientError,
    InvalidClientMetadataError,
    InvalidGrantError,
    InvalidRequestError,
    InvalidScopeError,
    InvalidTargetError,
    InvalidTokenError,
    MethodNotAllowedError,
    OAuthError,
    OAUTH_ERRORS,
    ServerError,
    TemporarilyUnavailableError,
    TooManyRequestsError,
    UnauthorizedClientError,
    UnsupportedGrantTypeError,
    UnsupportedResponseTypeError,
    UnsupportedTokenTypeError,
} from '../../src/auth/errors.js';

describe('OAuthError', () => {
    test('should construct with message and optional errorUri', () => {
        const error = new OAuthError('Test message', 'http://example.com/error');
        expect(error.message).toBe('Test message');
        expect(error.errorUri).toBe('http://example.com/error');
    });

    test('toResponseObject should return correct structure', () => {
        const error = new CustomOAuthError('custom_error', 'Custom message');
        const response = error.toResponseObject();
        expect(response).toEqual({
            error: 'custom_error',
            error_description: 'Custom message',
        });
    });

    test('toResponseObject should include error_uri if present', () => {
        const error = new CustomOAuthError(
            'custom_error',
            'Custom message',
            'http://example.com/error'
        );
        const response = error.toResponseObject();
        expect(response).toEqual({
            error: 'custom_error',
            error_description: 'Custom message',
            error_uri: 'http://example.com/error',
        });
    });

    test('base OAuthError should have undefined errorCode (abstract-like)', () => {
        // @ts-expect-error - testing base class behavior
        const error = new OAuthError('message');
        expect(error.errorCode).toBeUndefined();
    });
});

describe('Standard OAuth Errors', () => {
    const errorClasses = [
        { Class: InvalidRequestError, code: 'invalid_request' },
        { Class: InvalidClientError, code: 'invalid_client' },
        { Class: InvalidGrantError, code: 'invalid_grant' },
        { Class: UnauthorizedClientError, code: 'unauthorized_client' },
        { Class: UnsupportedGrantTypeError, code: 'unsupported_grant_type' },
        { Class: InvalidScopeError, code: 'invalid_scope' },
        { Class: AccessDeniedError, code: 'access_denied' },
        { Class: ServerError, code: 'server_error' },
        { Class: TemporarilyUnavailableError, code: 'temporarily_unavailable' },
        { Class: UnsupportedResponseTypeError, code: 'unsupported_response_type' },
        { Class: UnsupportedTokenTypeError, code: 'unsupported_token_type' },
        { Class: InvalidTokenError, code: 'invalid_token' },
        { Class: MethodNotAllowedError, code: 'method_not_allowed' },
        { Class: TooManyRequestsError, code: 'too_many_requests' },
        { Class: InvalidClientMetadataError, code: 'invalid_client_metadata' },
        { Class: InsufficientScopeError, code: 'insufficient_scope' },
        { Class: InvalidTargetError, code: 'invalid_target' },
    ];

    test.each(errorClasses)('$Class.name should have code $code', ({ Class, code }) => {
        expect(Class.errorCode).toBe(code);
        const error = new Class('message');
        expect(error).toBeInstanceOf(OAuthError);
        expect(error.errorCode).toBe(code);
        expect(error.toResponseObject()).toEqual({
            error: code,
            error_description: 'message',
        });
    });
});

describe('CustomOAuthError', () => {
    test('should use provided error code', () => {
        const error = new CustomOAuthError('my_custom_code', 'message');
        expect(error.errorCode).toBe('my_custom_code');
        expect(error.toResponseObject().error).toBe('my_custom_code');
    });
});

describe('OAUTH_ERRORS', () => {
    test('should contain all standard errors', () => {
        expect(OAUTH_ERRORS).toHaveProperty('invalid_request', InvalidRequestError);
        expect(OAUTH_ERRORS).toHaveProperty('invalid_client', InvalidClientError);
        expect(OAUTH_ERRORS).toHaveProperty('invalid_grant', InvalidGrantError);
        expect(OAUTH_ERRORS).toHaveProperty('unauthorized_client', UnauthorizedClientError);
        expect(OAUTH_ERRORS).toHaveProperty('unsupported_grant_type', UnsupportedGrantTypeError);
        expect(OAUTH_ERRORS).toHaveProperty('invalid_scope', InvalidScopeError);
        expect(OAUTH_ERRORS).toHaveProperty('access_denied', AccessDeniedError);
        expect(OAUTH_ERRORS).toHaveProperty('server_error', ServerError);
        expect(OAUTH_ERRORS).toHaveProperty('temporarily_unavailable', TemporarilyUnavailableError);
        expect(OAUTH_ERRORS).toHaveProperty('unsupported_response_type', UnsupportedResponseTypeError);
        expect(OAUTH_ERRORS).toHaveProperty('unsupported_token_type', UnsupportedTokenTypeError);
        expect(OAUTH_ERRORS).toHaveProperty('invalid_token', InvalidTokenError);
        expect(OAUTH_ERRORS).toHaveProperty('method_not_allowed', MethodNotAllowedError);
        expect(OAUTH_ERRORS).toHaveProperty('too_many_requests', TooManyRequestsError);
        expect(OAUTH_ERRORS).toHaveProperty('invalid_client_metadata', InvalidClientMetadataError);
        expect(OAUTH_ERRORS).toHaveProperty('insufficient_scope', InsufficientScopeError);
        expect(OAUTH_ERRORS).toHaveProperty('invalid_target', InvalidTargetError);
    });
});
