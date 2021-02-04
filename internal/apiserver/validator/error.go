package validator

import "strings"

type InvoiceValidationError struct {
	Errors []string `json:"errors"`
}

func (err *InvoiceValidationError) Error() string {
	return strings.Join(err.Errors, ", ")
}

type InvoiceValidationRequestError struct{}

func (err *InvoiceValidationRequestError) Error() string {
	return "Invoice validation request failed"
}
