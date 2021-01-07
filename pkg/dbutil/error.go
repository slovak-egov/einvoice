package dbutil

type IntegrityViolationError struct {
	Message string
}

func (e IntegrityViolationError) Error() string {
	return e.Message
}

type NotFoundError struct {
	Message string
}

func (e NotFoundError) Error() string {
	return e.Message
}
