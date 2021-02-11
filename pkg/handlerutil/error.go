package handlerutil

import (
	"net/http"
)

type HttpError struct {
	StatusCode int
	Message    string
	Detail     error
}

func (e *HttpError) Error() string {
	if e.Detail == nil {
		return ""
	} else {
		return e.Detail.Error()
	}
}

func (e *HttpError) WithDetail(err error) *HttpError {
	e.Detail = err
	return e
}

func NewBadRequestError(message string) *HttpError {
	return &HttpError{http.StatusBadRequest, message, nil}
}

func NewAuthorizationError(message string) *HttpError {
	return &HttpError{http.StatusUnauthorized, message, nil}
}

func NewForbiddenError(message string) *HttpError {
	return &HttpError{http.StatusForbidden, message, nil}
}

func NewNotFoundError(message string) *HttpError {
	return &HttpError{http.StatusNotFound, message, nil}
}

func NewFailedDependencyError(message string) *HttpError {
	return &HttpError{http.StatusFailedDependency, message, nil}
}

func NewTooManyRequestsError(message string) *HttpError {
	return &HttpError{http.StatusTooManyRequests, message, nil}
}
