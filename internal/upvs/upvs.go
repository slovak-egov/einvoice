package upvs

import (
	goContext "context"
	"crypto/rsa"
	"fmt"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/keys"
)

type Connector struct {
	baseUrl           string
	apiTokenPrivate   *rsa.PrivateKey
	oboTokenPublic    *rsa.PublicKey
	client            *http.Client
	logoutCallbackUrl string
}

func New(config Configuration) *Connector {
	if config.ApiTokenPrivateKey == "" {
		return nil
	}
	apiTokenPrivate, err := keys.GetPrivateKey(config.ApiTokenPrivateKey)
	if err != nil {
		log.WithField("error", err).Fatal("upvs.keys.apiTokenPrivate")
	}

	oboTokenPublic, err := keys.GetPublicKey(config.OboTokenPublicKey)
	if err != nil {
		log.WithField("error", err).Fatal("upvs.keys.oboTokenPublic")
	}

	return &Connector{
		baseUrl:           config.Url,
		apiTokenPrivate:   apiTokenPrivate,
		oboTokenPublic:    oboTokenPublic,
		client:            &http.Client{},
		logoutCallbackUrl: config.LogoutCallbackUrl,
	}
}

func (c *Connector) signOboToken(ctx goContext.Context, oboToken string) (string, error) {
	token, err := jwt.Parse(oboToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return c.oboTokenPublic, nil
	})
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Debug("upvs.signOboToken.parseToken.failed")
		return "", err
	}

	if !token.Valid {
		context.GetLogger(ctx).WithField("token", token).Debug("upvs.signOboToken.parseToken.invalid")
		return "", &InvalidTokenError{"Invalid token"}
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		context.GetLogger(ctx).WithField("error", err.Error()).Debug("upvs.signOboToken.parseClaims.failed")
		return "", &InvalidTokenError{"Cannot parse claims"}
	}

	upvsToken := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"exp": claims["exp"],
		"jti": uuid.New().String(),
		"obo": oboToken,
	})
	upvsToken.Header["alg"] = "RS256"
	upvsToken.Header["cty"] = "JWT"
	delete(upvsToken.Header, "typ")

	return upvsToken.SignedString(c.apiTokenPrivate)
}

func (c *Connector) signApiToken() (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"exp": time.Now().Add(time.Hour).Unix(),
		"jti": uuid.New().String(),
	})
	token.Header["alg"] = "RS256"

	return token.SignedString(c.apiTokenPrivate)
}
