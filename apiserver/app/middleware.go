package app

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
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
			userId, err = a.cache.GetUserId(token.Value)
		case ServiceAccountToken:
			userId, err = a.getUserByServiceAccount(token.Value)
		default:
			err = errors.New("Missing authorization")
		}

		if err != nil {
			log.WithField("token", token).Debug("app.authMiddleware.getUser.failed")
			handlerutil.RespondWithError(res, http.StatusUnauthorized, "Invalid token")
			return
		}

		RemoveTokenHeader(req)
		req.Header.Set("User-Id", strconv.Itoa(userId))

		// Call the next handler
		next.ServeHTTP(res, req)
	})
}

func (a *App) getUserByServiceAccount(tokenString string) (int, error) {
	var user *entity.User
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return nil, errors.New("Cannot parse claims")
		}

		user, err := a.db.GetSlovenskoSkUser(claims["sub"].(string))
		if err != nil {
			return nil, err
		}
		if user == nil {
			return nil, errors.New("User not found")
		}

		verifyKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(*user.ServiceAccountPublicKey))
		if err != nil {
			return nil, errors.New("Invalid key")
		}

		return verifyKey, nil
	})

	if err != nil {
		log.WithField("token", tokenString).Debug("app.authMiddleware.parseToken.failed")
		return 0, err
	}

	if !token.Valid {
		log.WithField("token", tokenString).Debug("app.authMiddleware.parseToken.invalid")
		return 0, errors.New("Invalid token")
	}

	return user.Id, nil
}
