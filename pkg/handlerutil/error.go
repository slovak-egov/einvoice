package handlerutil

import (
	"errors"
	"net/http"
)

type HttpError struct {
	Code  int
	Err   error
	Cause error
}

func (e *HttpError) Error() string {
	return e.Err.Error()
}

func (e *HttpError) Status() int {
	return e.Code
}

func (e *HttpError) WithCause(cause error) *HttpError {
	e.Cause = cause
	return e
}

func NewBadRequestError(message string) *HttpError {
	return &HttpError{http.StatusBadRequest, errors.New(message), nil}
}

func NewForbiddenError(message string) *HttpError {
	return &HttpError{http.StatusForbidden, errors.New(message), nil}
}

func NewNotFoundError(message string) *HttpError {
	return &HttpError{http.StatusNotFound, errors.New(message), nil}
}

func NewFailedDependencyError(message string) *HttpError {
	return &HttpError{http.StatusFailedDependency, errors.New(message), nil}
}

func AuthError(msg string) *HttpError {
	return &HttpError{http.StatusUnauthorized, errors.New("authorization." + msg), nil}
}

var AuthInvalidTypeError = AuthError("type.invalid")
var UnauthorizedError = AuthError("unauthorized")

func ApiKeyError(msg string) *HttpError {
	return AuthError("apiKey." + msg)
}

func ApiKeySignError(msg string) *HttpError {
	return ApiKeyError("sign." + msg)
}

func ApiKeyClaimError(key, msg string) *HttpError {
	return ApiKeyError(key + "." + msg)
}

func ApiKeyExpError(msg string) *HttpError {
	return ApiKeyClaimError("exp", msg)
}

func ApiKeyJtiError(msg string) *HttpError {
	return ApiKeyClaimError("jti", msg)
}

func InvoiceError(msg string) *HttpError {
	return NewBadRequestError("invoice." + msg)
}

func SubstituteError(msg string) *HttpError {
	return NewBadRequestError("substitute." + msg)
}

func UserError(msg string) *HttpError {
	return NewBadRequestError("user." + msg)
}
