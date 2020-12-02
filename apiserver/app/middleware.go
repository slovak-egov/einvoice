package app

import (
	goContext "context"
	"net/http"

	"github.com/dgrijalva/jwt-go"

	"github.com/slovak-egov/einvoice/apiserver/entity"
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
				userId, err = a.getUserByServiceAccount(req.Context(), token.Value)
			default:
				err = handlerutil.NewAuthorizationError("Wrong authorization type")
			}

			if _, ok := err.(*handlerutil.HttpError); ok {
				return handlerutil.NewAuthorizationError(err.Error())
			} else if err != nil {
				return err
			}

			req = req.WithContext(context.AddUserId(req.Context(), userId))

			// Call the next handler
			next.ServeHTTP(res, req)
			return nil
		}),
	)
}

func (a *App) getUserByServiceAccount(ctx goContext.Context, tokenString string) (int, error) {
	var user *entity.User
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, handlerutil.NewAuthorizationError("Unexpected signing method")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return nil, handlerutil.NewAuthorizationError("Cannot parse claims")
		}

		user, err := a.db.GetSlovenskoSkUser(ctx, claims["sub"].(string))
		if err != nil {
			return nil, err
		}

		verifyKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(*user.ServiceAccountPublicKey))
		if err != nil {
			return nil, handlerutil.NewAuthorizationError("Invalid key")
		}

		return verifyKey, nil
	})

	if err != nil {
		context.GetLogger(ctx).
			WithField("token", tokenString).
			Debug("app.authMiddleware.parseToken.failed")

		return 0, err
	}

	if !token.Valid {
		context.GetLogger(ctx).
			WithField("token", tokenString).
			Debug("app.authMiddleware.parseToken.invalid")

		return 0, handlerutil.NewAuthorizationError("Invalid key")
	}

	return user.Id, nil
}
