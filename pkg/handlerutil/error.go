package handlerutil

import (
	"errors"
	"net/http"
)

type HttpError struct {
	Code int
	Err  error
}

func (e HttpError) Error() string {
	return e.Err.Error()
}

func (e HttpError) Status() int {
	return e.Code
}

func NewBadRequestError(message string) *HttpError {
	return &HttpError{http.StatusBadRequest, errors.New(message)}
}

func NewAuthorizationError(message string) *HttpError {
	return &HttpError{http.StatusUnauthorized, errors.New(message)}
}

func NewForbiddenError(message string) *HttpError {
	return &HttpError{http.StatusForbidden, errors.New(message)}
}

func NewNotFoundError(message string) *HttpError {
	return &HttpError{http.StatusNotFound, errors.New(message)}
}

func NewFailedDependencyError(message string) *HttpError {
	return &HttpError{http.StatusFailedDependency, errors.New(message)}
}
