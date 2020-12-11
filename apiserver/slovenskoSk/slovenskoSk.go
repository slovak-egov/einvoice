package slovenskoSk

import (
	"crypto/rsa"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/config"
)

type Connector struct {
	baseUrl         string
	apiTokenPrivate *rsa.PrivateKey
	oboTokenPublic  *rsa.PublicKey
	client          *http.Client
}

func New(config config.SlovenskoSkConfiguration) *Connector {
	if config.ApiTokenPrivateKey == "" {
		return nil
	}
	return &Connector{
		baseUrl:         config.Url,
		apiTokenPrivate: getPrivateKey(config.ApiTokenPrivateKey),
		oboTokenPublic:  getPublicKey(config.OboTokenPublicKey),
		client:          &http.Client{},
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
