package invoiceValidator

import "strings"

type ValidationError struct {
	Errors []string `json:"errors"`
}

func (err *ValidationError) Error() string {
	return strings.Join(err.Errors, ", ")
}

type RequestError struct{}

func (err *RequestError) Error() string {
	return "Invoice validation request failed"
}
