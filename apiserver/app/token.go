package app

import (
	"net/http"
	"strings"
)

const (
	BearerToken         = "BearerToken"
	ServiceAccountToken = "ServiceAccountToken"
)

type Token struct {
	Value string
	Type  string
}

type MissingToken struct{}

func (e MissingToken) Error() string {
	return AuthError("missing").Error()
}

func getBearerToken(header string) (*Token, error) {
	parts := strings.Split(header, " ")
	if len(parts) != 2 {
		return nil, AuthError("bearer.invalid")
	}
	if parts[0] != "Bearer" {
		return nil, AuthInvalidTypeError
	}
	return &Token{parts[1], BearerToken}, nil
}

func getApiToken(apiKey string) (*Token, error) {
	return &Token{apiKey, ServiceAccountToken}, nil
}

func GetAuthToken(req *http.Request) (*Token, error) {
	authorizationHeader := req.Header.Get("Authorization")
	if authorizationHeader != "" {
		return getBearerToken(authorizationHeader)
	}

	apiKey := req.Header.Get("X-API-Key")
	if apiKey != "" {
		return getApiToken(apiKey)
	}

	// Temporarily allow sending token via query parameter
	token := req.URL.Query().Get("token")
	if token != "" {
		return getBearerToken("Bearer " + token)
	}

	return nil, &MissingToken{}
}
