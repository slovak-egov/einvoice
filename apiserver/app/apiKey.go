package app

import (
	goContext "context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/cache"
	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func getIntClaim(claims jwt.MapClaims, key string) (int, error) {
	rawValue, ok := claims[key]
	if !ok {
		return 0, fmt.Errorf("Key '%v' not found in claims", key)
	}
	if v, ok := rawValue.(json.Number); ok {
		if i, err := v.Int64(); err == nil {
			return int(i), nil
		}
	}
	return 0, fmt.Errorf("Key '%v' in claims has wrong type", key)
}

func getStringClaim(claims jwt.MapClaims, key string) (string, error) {
	rawValue, ok := claims[key]
	if !ok {
		return "", fmt.Errorf("Key '%v' not found in claims", key)
	}
	if v, ok := rawValue.(string); ok {
		return v, nil
	}
	return "", fmt.Errorf("Key '%v' in claims has wrong type", key)
}

// Validate if exp belongs to interval <now(), now()+maxExpiration>
func validateExp(exp int, maxExpiration time.Duration) error {
	currentTime, expTime := time.Now(), time.Unix(int64(exp), 0)

	if currentTime.After(expTime) {
		return errors.New("Token has expired")
	} else if currentTime.Add(maxExpiration).Before(expTime) {
		return errors.New("Token expiration time is too long")
	}

	return nil
}

func validateJti(ctx goContext.Context, jti string, userId int, cache *cache.Cache) error {
	if matched, err := regexp.Match(`\A[0-9a-zA-Z\-_]{32,256}\z`, []byte(jti)); err != nil {
		return err
	} else if !matched {
		return errors.New("Invalid jti")
	}
	if exists, err := cache.ContainsJti(ctx, userId, jti); err != nil {
		return err
	} else if exists {
		return errors.New("Invalid reused jti")
	}
	return nil
}

func (a *App) getUserIdByApiKey(ctx goContext.Context, tokenString string) (int, error) {
	var user *entity.User
	var jti string
	jwtParser := jwt.Parser{UseJSONNumber: true}
	token, err := jwtParser.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, handlerutil.NewAuthorizationError("Unexpected signing method")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return nil, handlerutil.NewAuthorizationError("Cannot parse claims")
		}

		var (
			err    error
			exp    int
			userId int
		)

		if userId, err = getIntClaim(claims, "sub"); err != nil {
			return nil, handlerutil.NewAuthorizationError(err.Error())
		}

		if exp, err = getIntClaim(claims, "exp"); err != nil {
			return nil, handlerutil.NewAuthorizationError(err.Error())
		}
		if err = validateExp(exp, a.config.ApiKey.MaxExpiration); err != nil {
			return nil, handlerutil.NewAuthorizationError(err.Error())
		}

		user, err = a.db.GetUser(ctx, userId)
		if err != nil {
			return nil, err
		}

		if jti, err = getStringClaim(claims, "jti"); err != nil {
			return nil, handlerutil.NewAuthorizationError(err.Error())
		}
		if err = validateJti(ctx, jti, userId, a.cache); err != nil {
			return nil, handlerutil.NewAuthorizationError(err.Error())
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

	if err = a.cache.AddJti(ctx, user.Id, jti, a.config.ApiKey.JtiExpiration); err != nil {
		context.GetLogger(ctx).
			WithFields(log.Fields{
				"token": tokenString,
				"error": err.Error(),
			}).
			Debug("app.authMiddleware.parseToken.cache.failed")

		return 0, err
	}

	return user.Id, nil
}
