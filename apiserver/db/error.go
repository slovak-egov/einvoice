package db

type IntegrityViolationError struct {
	Message string
}

func (e IntegrityViolationError) Error() string {
	return e.Message
}

type NoSubstituteError struct {
	Message string
}

func (e NoSubstituteError) Error() string {
	return e.Message
}

type NotFoundError struct {
	Message string
}

func (e NotFoundError) Error() string {
	return e.Message
}
