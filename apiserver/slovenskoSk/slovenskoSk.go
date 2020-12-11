package slovenskoSk

import (
	goContext "context"
	"crypto/rsa"
	"fmt"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/config"
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

func New(config config.SlovenskoSkConfiguration) *Connector {
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
		log.WithField("error", err.Error()).Fatal("slovenskosk.keys.parsePrivate")
	}

	return signKey
}

func getPublicKey(publicKey string) *rsa.PublicKey {
	verifyBytes := "-----BEGIN RSA PUBLIC KEY-----\n" +
		strings.ReplaceAll(publicKey, " ", string(byte(10))) +
		"\n-----END RSA PUBLIC KEY-----\n"
	verifyKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(verifyBytes))
	if err != nil {
		log.WithField("error", err).Fatal("slovenskosk.keys.parsePublic")
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
		context.GetLogger(ctx).WithField("error", err.Error()).Debug("slovenskosk.signOboToken.parseToken.failed")
		return "", err
	}

	if !token.Valid {
		context.GetLogger(ctx).WithField("token", token).Debug("slovenskosk.signOboToken.parseToken.invalid")
		return "", &InvalidTokenError{"Invalid token"}
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", &InvalidTokenError{"Cannot parse claims"}
	}

	slovenskoSkToken := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"exp": claims["exp"],
		"jti": random.String(32),
		"obo": oboToken,
	})
	slovenskoSkToken.Header["alg"] = "RS256"
	slovenskoSkToken.Header["cty"] = "JWT"
	delete(slovenskoSkToken.Header, "typ")

	return slovenskoSkToken.SignedString(c.apiTokenPrivate)
}
