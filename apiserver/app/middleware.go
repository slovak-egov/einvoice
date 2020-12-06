package app

import (
	"net/http"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(
		handlerutil.ErrorHandler(func(res http.ResponseWriter, req *http.Request) error {
			token, err := GetAuthToken(req)
			if err != nil {
				return handlerutil.NewAuthorizationError(err.Error())
			}

			var userId int

			switch token.Type {
			case BearerToken:
				userId, err = a.cache.GetUserId(req.Context(), token.Value)
			case ServiceAccountToken:
				userId, err = a.getUserIdByApiKey(req.Context(), token.Value)
			default:
				err = handlerutil.NewAuthorizationError("Wrong authorization type")
			}

			if err != nil {
				return handlerutil.NewAuthorizationError(err.Error())
			}

			req = req.WithContext(context.AddUserId(req.Context(), userId))

			// Call the next handler
			next.ServeHTTP(res, req)
			return nil
		}),
	)
}
