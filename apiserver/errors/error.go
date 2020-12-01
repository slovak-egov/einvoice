package errors

type NotFound struct {
	Message string
}

func (e NotFound) Error() string {
	return e.Message
}

type Authorization struct {
	Message string
}

func (e Authorization) Error() string {
	return e.Message
}
