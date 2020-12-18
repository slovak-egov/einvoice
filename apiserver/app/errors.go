package app

import "fmt"

func AuthError(msg string) error {
	return fmt.Errorf("authorization." + msg)
}

func ApiKeyError(msg string) error {
	return AuthError("apiKey." + msg)
}

func ApiKeySignError(msg string) error {
	return ApiKeyError("sign." + msg)
}

func ApiKeyClaimError(key, msg string) error {
	return ApiKeyError(key + "." + msg)
}

func ApiKeyExpError(msg string) error {
	return ApiKeyClaimError("exp", msg)
}

func ApiKeyJtiError(msg string) error {
	return ApiKeyClaimError("jti", msg)
}
