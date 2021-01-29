package upvs

import (
	goContext "context"
	"crypto/rsa"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/random"
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
	return &Connector{
		baseUrl:           config.Url,
		apiTokenPrivate:   getPrivateKey(config.ApiTokenPrivateKey),
		oboTokenPublic:    getPublicKey(config.OboTokenPublicKey),
		client:            &http.Client{},
		logoutCallbackUrl: config.LogoutCallbackUrl,
	}
}

func getPrivateKey(privateKey string) *rsa.PrivateKey {
	signBytes := "-----BEGIN RSA PRIVATE KEY-----\n" +
		strings.ReplaceAll(privateKey, " ", string(byte(10))) +
		"\n-----END RSA PRIVATE KEY-----\n"
	signKey, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(signBytes))
	if err != nil {
		log.WithField("error", err.Error()).Fatal("upvs.keys.parsePrivate")
		return nil
	}

	return signKey
}

func getPublicKey(publicKey string) *rsa.PublicKey {
	if publicKey == "" {
		log.Warn("upvs.keys.parsePublic.undefined")
		return nil
	}

	verifyBytes := "-----BEGIN RSA PUBLIC KEY-----\n" +
		strings.ReplaceAll(publicKey, " ", string(byte(10))) +
		"\n-----END RSA PUBLIC KEY-----\n"
	verifyKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(verifyBytes))
	if err != nil {
		log.WithField("error", err).Fatal("upvs.keys.parsePublic")
		return nil
	}

	return verifyKey
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
		"jti": random.String(32),
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
		"jti": random.String(32),
	})
	token.Header["alg"] = "RS256"

	return token.SignedString(c.apiTokenPrivate)
}
