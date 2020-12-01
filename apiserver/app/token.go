package app

import (
	"net/http"
	"strings"

	myErrors "github.com/slovak-egov/einvoice/apiserver/errors"
)

const (
	BearerToken          = "BearerToken"
	ServiceAccountToken  = "ServiceAccountToken"
)

type Token struct {
	Value string
	Type  string
}

func getBearerToken(header string) (*Token, error) {
	parts := strings.Split(header, " ")
	if len(parts) != 2 {
		return nil, myErrors.Authorization{"Invalid token format"}
	}
	if parts[0] != "Bearer" {
		return nil, myErrors.Authorization{"Invalid authorization type"}
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

	return nil, myErrors.Authorization{"Missing authorization"}
}
