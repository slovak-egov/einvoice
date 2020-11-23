package app

import (
	"errors"
	"net/http"
	"strings"
)

const (
	BearerToken          = "BearerToken"
	ServiceAccountToken  = "ServiceAccountToken"
)

type Token struct {
	Value string
	Type  string
}

func GetAuthToken(req *http.Request) (*Token, error) {
	bearerTokenHeader := req.Header.Get("Authorization")
	if bearerTokenHeader != "" {
		parts := strings.Split(bearerTokenHeader, " ")
		if len(parts) != 2 {
			return nil, errors.New("Invalid token format")
		}
		if parts[0] != "Bearer" {
			return nil, errors.New("Invalid authorization type")
		}
		return &Token{parts[1], BearerToken}, nil
	}

	serviceAccountTokenHeader := req.Header.Get("X-API-Key")
	if serviceAccountTokenHeader != "" {
		return &Token{serviceAccountTokenHeader, ServiceAccountToken}, nil
	}

	return nil, errors.New("Missing authorization")
}

func RemoveTokenHeader(req *http.Request) {
	req.Header.Del("Authorization")
	req.Header.Del("X-API-Key")
}
