package app

import (
	"crypto/rsa"
	"strings"

	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"
)

func getPrivateKey(privateKey string) *rsa.PrivateKey {
	signBytes := "-----BEGIN RSA PRIVATE KEY-----\n" +
		strings.ReplaceAll(privateKey, " ", string(byte(10))) +
		"\n-----END RSA PRIVATE KEY-----\n"
	signKey, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(signBytes))
	if err != nil {
		log.WithField("error", err.Error()).Fatal("keys.parsePrivate")
	}

	return signKey
}

func getPublicKey(publicKey string) *rsa.PublicKey {
	verifyBytes := "-----BEGIN RSA PUBLIC KEY-----\n" +
		strings.ReplaceAll(publicKey, " ", string(byte(10))) +
		"\n-----END RSA PUBLIC KEY-----\n"
	verifyKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(verifyBytes))
	if err != nil {
		log.WithField("error", err).Fatal("keys.parsePublic")
	}

	return verifyKey
}
