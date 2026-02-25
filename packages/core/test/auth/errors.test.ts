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
    test('should convert to response object with required fields', () => {
        const error = new CustomOAuthError('custom_error', 'Something went wrong');
        expect(error.toResponseObject()).toEqual({
            error: 'custom_error',
            error_description: 'Something went wrong'
        });
    });

    test('should convert to response object with optional error URI', () => {
        const error = new CustomOAuthError('custom_error', 'Something went wrong', 'https://example.com/error');
        expect(error.toResponseObject()).toEqual({
            error: 'custom_error',
            error_description: 'Something went wrong',
            error_uri: 'https://example.com/error'
        });
    });

    test('should inherit from Error', () => {
        const error = new CustomOAuthError('code', 'message');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(OAuthError);
        expect(error.name).toBe('CustomOAuthError');
    });
});

describe('Standard OAuth Errors', () => {
    test('InvalidRequestError', () => {
        const error = new InvalidRequestError('Invalid request');
        expect(error.errorCode).toBe('invalid_request');
        expect(InvalidRequestError.errorCode).toBe('invalid_request');
        expect(error.toResponseObject().error).toBe('invalid_request');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('InvalidClientError', () => {
        const error = new InvalidClientError('Invalid client');
        expect(error.errorCode).toBe('invalid_client');
        expect(InvalidClientError.errorCode).toBe('invalid_client');
        expect(error.toResponseObject().error).toBe('invalid_client');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('InvalidGrantError', () => {
        const error = new InvalidGrantError('Invalid grant');
        expect(error.errorCode).toBe('invalid_grant');
        expect(InvalidGrantError.errorCode).toBe('invalid_grant');
        expect(error.toResponseObject().error).toBe('invalid_grant');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('UnauthorizedClientError', () => {
        const error = new UnauthorizedClientError('Unauthorized client');
        expect(error.errorCode).toBe('unauthorized_client');
        expect(UnauthorizedClientError.errorCode).toBe('unauthorized_client');
        expect(error.toResponseObject().error).toBe('unauthorized_client');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('UnsupportedGrantTypeError', () => {
        const error = new UnsupportedGrantTypeError('Unsupported grant type');
        expect(error.errorCode).toBe('unsupported_grant_type');
        expect(UnsupportedGrantTypeError.errorCode).toBe('unsupported_grant_type');
        expect(error.toResponseObject().error).toBe('unsupported_grant_type');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('InvalidScopeError', () => {
        const error = new InvalidScopeError('Invalid scope');
        expect(error.errorCode).toBe('invalid_scope');
        expect(InvalidScopeError.errorCode).toBe('invalid_scope');
        expect(error.toResponseObject().error).toBe('invalid_scope');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('AccessDeniedError', () => {
        const error = new AccessDeniedError('Access denied');
        expect(error.errorCode).toBe('access_denied');
        expect(AccessDeniedError.errorCode).toBe('access_denied');
        expect(error.toResponseObject().error).toBe('access_denied');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('ServerError', () => {
        const error = new ServerError('Server error');
        expect(error.errorCode).toBe('server_error');
        expect(ServerError.errorCode).toBe('server_error');
        expect(error.toResponseObject().error).toBe('server_error');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('TemporarilyUnavailableError', () => {
        const error = new TemporarilyUnavailableError('Temporarily unavailable');
        expect(error.errorCode).toBe('temporarily_unavailable');
        expect(TemporarilyUnavailableError.errorCode).toBe('temporarily_unavailable');
        expect(error.toResponseObject().error).toBe('temporarily_unavailable');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('UnsupportedResponseTypeError', () => {
        const error = new UnsupportedResponseTypeError('Unsupported response type');
        expect(error.errorCode).toBe('unsupported_response_type');
        expect(UnsupportedResponseTypeError.errorCode).toBe('unsupported_response_type');
        expect(error.toResponseObject().error).toBe('unsupported_response_type');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('UnsupportedTokenTypeError', () => {
        const error = new UnsupportedTokenTypeError('Unsupported token type');
        expect(error.errorCode).toBe('unsupported_token_type');
        expect(UnsupportedTokenTypeError.errorCode).toBe('unsupported_token_type');
        expect(error.toResponseObject().error).toBe('unsupported_token_type');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('InvalidTokenError', () => {
        const error = new InvalidTokenError('Invalid token');
        expect(error.errorCode).toBe('invalid_token');
        expect(InvalidTokenError.errorCode).toBe('invalid_token');
        expect(error.toResponseObject().error).toBe('invalid_token');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('MethodNotAllowedError', () => {
        const error = new MethodNotAllowedError('Method not allowed');
        expect(error.errorCode).toBe('method_not_allowed');
        expect(MethodNotAllowedError.errorCode).toBe('method_not_allowed');
        expect(error.toResponseObject().error).toBe('method_not_allowed');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('TooManyRequestsError', () => {
        const error = new TooManyRequestsError('Too many requests');
        expect(error.errorCode).toBe('too_many_requests');
        expect(TooManyRequestsError.errorCode).toBe('too_many_requests');
        expect(error.toResponseObject().error).toBe('too_many_requests');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('InvalidClientMetadataError', () => {
        const error = new InvalidClientMetadataError('Invalid client metadata');
        expect(error.errorCode).toBe('invalid_client_metadata');
        expect(InvalidClientMetadataError.errorCode).toBe('invalid_client_metadata');
        expect(error.toResponseObject().error).toBe('invalid_client_metadata');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('InsufficientScopeError', () => {
        const error = new InsufficientScopeError('Insufficient scope');
        expect(error.errorCode).toBe('insufficient_scope');
        expect(InsufficientScopeError.errorCode).toBe('insufficient_scope');
        expect(error.toResponseObject().error).toBe('insufficient_scope');
        expect(error).toBeInstanceOf(OAuthError);
    });

    test('InvalidTargetError', () => {
        const error = new InvalidTargetError('Invalid target');
        expect(error.errorCode).toBe('invalid_target');
        expect(InvalidTargetError.errorCode).toBe('invalid_target');
        expect(error.toResponseObject().error).toBe('invalid_target');
        expect(error).toBeInstanceOf(OAuthError);
    });
});

describe('OAUTH_ERRORS registry', () => {
    test('should contain all standard errors', () => {
        expect(OAUTH_ERRORS['invalid_request']).toBe(InvalidRequestError);
        expect(OAUTH_ERRORS['invalid_client']).toBe(InvalidClientError);
        expect(OAUTH_ERRORS['invalid_grant']).toBe(InvalidGrantError);
        expect(OAUTH_ERRORS['unauthorized_client']).toBe(UnauthorizedClientError);
        expect(OAUTH_ERRORS['unsupported_grant_type']).toBe(UnsupportedGrantTypeError);
        expect(OAUTH_ERRORS['invalid_scope']).toBe(InvalidScopeError);
        expect(OAUTH_ERRORS['access_denied']).toBe(AccessDeniedError);
        expect(OAUTH_ERRORS['server_error']).toBe(ServerError);
        expect(OAUTH_ERRORS['temporarily_unavailable']).toBe(TemporarilyUnavailableError);
        expect(OAUTH_ERRORS['unsupported_response_type']).toBe(UnsupportedResponseTypeError);
        expect(OAUTH_ERRORS['unsupported_token_type']).toBe(UnsupportedTokenTypeError);
        expect(OAUTH_ERRORS['invalid_token']).toBe(InvalidTokenError);
        expect(OAUTH_ERRORS['method_not_allowed']).toBe(MethodNotAllowedError);
        expect(OAUTH_ERRORS['too_many_requests']).toBe(TooManyRequestsError);
        expect(OAUTH_ERRORS['invalid_client_metadata']).toBe(InvalidClientMetadataError);
        expect(OAUTH_ERRORS['insufficient_scope']).toBe(InsufficientScopeError);
        expect(OAUTH_ERRORS['invalid_target']).toBe(InvalidTargetError);
    });
});
