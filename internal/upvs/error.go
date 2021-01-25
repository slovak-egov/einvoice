package upvs

type UpvsError struct {
	Message string
}

func (e UpvsError) Error() string {
	return e.Message
}

type InvalidTokenError struct {
	Message string
}

func (e InvalidTokenError) Error() string {
	return e.Message
}
