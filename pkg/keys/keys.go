package keys

import (
	"crypto/rsa"
	"strings"

	"github.com/dgrijalva/jwt-go"
)

func GetPrivateKey(privateKey string) (*rsa.PrivateKey, error) {
	bytes := "-----BEGIN RSA PRIVATE KEY-----\n" +
		strings.ReplaceAll(privateKey, " ", string(byte(10))) +
		"\n-----END RSA PRIVATE KEY-----\n"
	return jwt.ParseRSAPrivateKeyFromPEM([]byte(bytes))
}

func GetPublicKey(publicKey string) (*rsa.PublicKey, error) {
	bytes := "-----BEGIN RSA PUBLIC KEY-----\n" +
		strings.ReplaceAll(publicKey, " ", string(byte(10))) +
		"\n-----END RSA PUBLIC KEY-----\n"
	return jwt.ParseRSAPublicKeyFromPEM([]byte(bytes))
}
