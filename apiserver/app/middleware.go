package app

import (
	 goContext "context"
	"errors"
	"net/http"

	"github.com/dgrijalva/jwt-go"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	myErrors "github.com/slovak-egov/einvoice/apiserver/errors"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		token, err := GetAuthToken(req)
		if err != nil {
			handlerutil.RespondWithError(res, http.StatusUnauthorized, err.Error())
			return
		}

		var userId int

		switch token.Type {
		case BearerToken:
			userId, err = a.cache.GetUserId(req.Context(), token.Value)
		case ServiceAccountToken:
			userId, err = a.getUserByServiceAccount(req.Context(), token.Value)
		default:
			err = myErrors.Authorization{"Wrong authorization type"}
		}

		if errors.As(err, &myErrors.NotFound{}) || errors.As(err, &myErrors.Authorization{}) {
			handlerutil.RespondWithError(res, http.StatusUnauthorized, err.Error())
			return
		} else if err != nil {
			handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
			return
		}

		req = req.WithContext(context.AddUserId(req.Context(), userId))

		// Call the next handler
		next.ServeHTTP(res, req)
	})
}

func (a *App) getUserByServiceAccount(ctx goContext.Context, tokenString string) (int, error) {
	var user *entity.User
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, myErrors.Authorization{"Unexpected signing method"}
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return nil, myErrors.Authorization{"Cannot parse claims"}
		}

		user, err := a.db.GetSlovenskoSkUser(claims["sub"].(string))
		if err != nil {
			return nil, err
		}

		verifyKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(*user.ServiceAccountPublicKey))
		if err != nil {
			return nil, myErrors.Authorization{"Invalid key"}
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

		return 0, myErrors.Authorization{"Invalid key"}
	}

	return user.Id, nil
}
