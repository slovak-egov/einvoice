package app

import (
	goContext "context"
	"encoding/json"
	"regexp"
	"time"

	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/cache"
	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func getIntClaim(claims jwt.MapClaims, key string) (int, error) {
	rawValue, ok := claims[key]
	if !ok {
		return 0, ApiKeyClaimError(key, "missing")
	}
	if v, ok := rawValue.(json.Number); ok {
		if i, err := v.Int64(); err == nil {
			return int(i), nil
		}
	}
	return 0, ApiKeyClaimError(key, "wrongType")
}

func getStringClaim(claims jwt.MapClaims, key string) (string, error) {
	rawValue, ok := claims[key]
	if !ok {
		return "", ApiKeyClaimError(key, "missing")
	}
	if v, ok := rawValue.(string); ok {
		return v, nil
	}
	return "", ApiKeyClaimError(key, "wrongType")
}

// Validate if exp belongs to interval <now(), now()+maxExpiration>
func validateExp(exp int, maxExpiration time.Duration) error {
	currentTime, expTime := time.Now(), time.Unix(int64(exp), 0)

	if currentTime.After(expTime) {
		return ApiKeyExpError("expired")
	} else if currentTime.Add(maxExpiration).Before(expTime) {
		return ApiKeyExpError("tooLong")
	}

	return nil
}

func validateJti(jti string) error {
	if matched, err := regexp.Match(`\A[0-9a-zA-Z\-_]{32,256}\z`, []byte(jti)); err != nil {
		return err
	} else if !matched {
		return ApiKeyJtiError("invalid")
	}

	return nil
}

func (a *App) getUserIdByApiKey(ctx goContext.Context, tokenString string) (int, error) {
	var user *entity.User
	var jti string
	jwtParser := jwt.Parser{UseJSONNumber: true}
	token, err := jwtParser.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, ApiKeySignError("method.invalid")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return nil, ApiKeyError("claims.parsingError")
		}

		var (
			err    error
			exp    int
			userId int
		)

		if userId, err = getIntClaim(claims, "sub"); err != nil {
			return nil, err
		}

		if exp, err = getIntClaim(claims, "exp"); err != nil {
			return nil, err
		}
		if err = validateExp(exp, a.config.ApiKey.MaxExpiration); err != nil {
			return nil, err
		}

		user, err = a.db.GetUser(ctx, userId)
		if err != nil {
			if _, ok := err.(*db.NotFoundError); ok {
				return nil, handlerutil.NewNotFoundError("user.notFound")
			}
			return nil, err
		}

		if jti, err = getStringClaim(claims, "jti"); err != nil {
			return nil, err
		}
		if err = validateJti(jti); err != nil {
			return nil, err
		}

		verifyKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(*user.ServiceAccountPublicKey))
		if err != nil {
			return nil, ApiKeyError("publicKey.invalid")
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

		if v, ok := err.(*jwt.ValidationError); ok {
			return 0, v.Inner
		}
		return 0, err
	}

	if !token.Valid {
		context.GetLogger(ctx).
			WithField("token", tokenString).
			Debug("app.authMiddleware.parseToken.invalid")

		return 0, ApiKeySignError("invalid")
	}

	if err := a.cache.SaveJti(ctx, user.Id, jti, a.config.ApiKey.JtiExpiration); err != nil {
		context.GetLogger(ctx).
			WithFields(log.Fields{
				"token": tokenString,
				"error": err.Error(),
			}).
			Debug("app.authMiddleware.parseToken.invalid")

		if _, ok := err.(*cache.JtiExistsError); ok {
			return 0, ApiKeyJtiError("reused")
		}
		return 0, err
	}

	return user.Id, nil
}
