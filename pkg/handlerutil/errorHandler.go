package handlerutil

import (
	"errors"
	"net/http"
)

func ErrorHandler(handler func(http.ResponseWriter, *http.Request) error) func(http.ResponseWriter, *http.Request) {
	return func(res http.ResponseWriter, req *http.Request) {
		err := handler(res, req)
		if err != nil {
			var e *HttpError
			if errors.As(err, &e) {
				respondWithError(res, e.StatusCode, e.Message, e.Error())
			} else {
				// Return 500 on other errors
				respondWithError(res, http.StatusInternalServerError, "Something went wrong", "")
			}
		}
	}
}
