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

func NewAuthorizationError(message string) *HttpError {
	return &HttpError{http.StatusUnauthorized, errors.New(message), nil}
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

func NewTooManyRequestsError(message string) *HttpError {
	return &HttpError{http.StatusTooManyRequests, errors.New(message), nil}
}
