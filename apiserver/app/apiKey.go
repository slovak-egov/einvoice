package app

import (
	goContext "context"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) getUserIdByApiKey(ctx goContext.Context, tokenString string) (int, error) {
	var user *entity.User
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, handlerutil.NewAuthorizationError("Unexpected signing method")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return nil, handlerutil.NewAuthorizationError("Cannot parse claims")
		}

		var (
			err error
			rawUserId string
			userId int
		)
		if rawUserId, ok = claims["sub"].(string); !ok {
			return nil, handlerutil.NewNotFoundError("User not found")
		}
		if userId, err = strconv.Atoi(rawUserId); err != nil {
			return nil, handlerutil.NewNotFoundError("User not found")
		}

		user, err = a.db.GetUser(ctx, userId)
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
			WithFields(log.Fields{
				"token": tokenString,
				"error": err.Error(),
			}).
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
