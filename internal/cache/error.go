package cache

import "fmt"

type TokenNotFoundError struct {
	token string
}

func (e *TokenNotFoundError) Error() string {
	return fmt.Sprintf("Token not found %s", e.token)
}

type JtiExistsError struct {
	jti string
}

func (e *JtiExistsError) Error() string {
	return fmt.Sprintf("Jti exists %s", e.jti)
}
