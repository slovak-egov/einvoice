package apiserver

import (
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func AuthError(msg string) *handlerutil.HttpError {
	return handlerutil.NewAuthorizationError("authorization." + msg)
}

var AuthInvalidTypeError = AuthError("type.invalid")
var UnauthorizedError = AuthError("unauthorized")

func ApiKeyError(msg string) *handlerutil.HttpError {
	return AuthError("apiKey." + msg)
}

func ApiKeySignError(msg string) *handlerutil.HttpError {
	return ApiKeyError("sign." + msg)
}

func ApiKeyClaimError(key, msg string) *handlerutil.HttpError {
	return ApiKeyError(key + "." + msg)
}

func ApiKeyExpError(msg string) *handlerutil.HttpError {
	return ApiKeyClaimError("exp", msg)
}

func ApiKeyJtiError(msg string) *handlerutil.HttpError {
	return ApiKeyClaimError("jti", msg)
}

func InvoiceError(msg string) *handlerutil.HttpError {
	return handlerutil.NewBadRequestError("invoice." + msg)
}

func SubstituteError(msg string) *handlerutil.HttpError {
	return handlerutil.NewBadRequestError("substitute." + msg)
}

func UserError(msg string) *handlerutil.HttpError {
	return handlerutil.NewBadRequestError("user." + msg)
}

func UpvsError(msg string) *handlerutil.HttpError {
	return handlerutil.NewFailedDependencyError("authorization.upvs." + msg)
}

func DraftError(msg string) *handlerutil.HttpError {
	return handlerutil.NewBadRequestError("draft." + msg)
}
