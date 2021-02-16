package xml

import "strings"

type ValidationError struct {
	Errors []error
}

func (e ValidationError) Error() string {
	errorMessages := []string{}
	for _, err := range e.Errors {
		errorMessages = append(errorMessages, err.Error())
	}
	return strings.Join(errorMessages, "\n")
}
