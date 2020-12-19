package app

import (
	"net/http"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) userIdentificationMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(
		handlerutil.ErrorHandler(func(res http.ResponseWriter, req *http.Request) error {
			token, err := GetAuthToken(req)
			// Skip token not found error
			if _, ok := err.(*MissingToken); !ok && err != nil {
				return handlerutil.AuthError("missing")
			}

			var userId int

			// If user provided token, try to identify him
			if token != nil {
				switch token.Type {
				case BearerToken:
					userId, err = a.cache.GetUserId(req.Context(), token.Value)
				case ServiceAccountToken:
					userId, err = a.getUserIdByApiKey(req.Context(), token.Value)
				default:
					err = handlerutil.AuthInvalidTypeError
				}

				if err != nil {
					return err
				}
			}

			req = req.WithContext(context.AddUserId(req.Context(), userId))

			// Call the next handler
			next.ServeHTTP(res, req)
			return nil
		}),
	)
}

func requireUserMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(
		handlerutil.ErrorHandler(func(res http.ResponseWriter, req *http.Request) error {
			// User is not authenticated
			if context.GetUserId(req.Context()) == 0 {
				return handlerutil.UnauthorizedError
			}
			next.ServeHTTP(res, req)
			return nil
		}),
	)
}
