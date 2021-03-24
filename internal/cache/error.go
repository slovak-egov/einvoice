package cache

import "fmt"

type NotFoundError struct {
	name string
	id   string
}

func (e *NotFoundError) Error() string {
	return fmt.Sprintf("%s %s not found", e.name, e.id)
}

type JtiExistsError struct {
	jti string
}

func (e *JtiExistsError) Error() string {
	return fmt.Sprintf("Jti %s already exists", e.jti)
}
