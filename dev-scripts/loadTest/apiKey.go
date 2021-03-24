package loadTest

import (
	"crypto/rsa"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

func getUserJwt(userId int, privateKey *rsa.PrivateKey) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"exp": time.Now().Add(time.Minute).Unix(),
		"jti": uuid.New().String(),
		"sub": userId,
	})
	token.Header["alg"] = "RS256"

	return token.SignedString(privateKey)
}
