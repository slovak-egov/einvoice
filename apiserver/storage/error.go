package storage

type NotFoundError struct {
	msg string
}

func (e *NotFoundError) Error() string {
	return e.msg
}
