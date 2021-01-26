package apiserver

import (
	"fmt"
	"net/http"
	"strconv"
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"

	"github.com/slovak-egov/einvoice/pkg/random"
)

func TestApiKey(t *testing.T) {
	// Fill DB
	t.Cleanup(cleanDb(t))
	user, _ := createTestUser(t, "")

	privateKey := "-----BEGIN RSA PRIVATE KEY-----\nMIIEpgIBAAKCAQEA8VGNznEjnNxvSxA1jPoTUElr4kOqkeDNkA7J12vjov80Q1MM\nSjST0kbUEsacLzJG3YooXOWK9/Mpjvp+iA64qEMVI+ki6hCaQI8xlD5JgTHXCvjz\n29zX4UsuK+V6cTKWuwk/wkxMu2pxA6p3oVvE3275PXlhvjku7u0j/LYeWxcuhAVA\nM3Ldwku9NO1uq1bjshlNhBfZpMF406lnUHCKyy4mPllilpUPe10oyGQK+7U5V4De\nKvBIBTKhTr1BOwCLwKETzNS1wzDvmGvNCbJyiGkwDeuHiEdh0fHDFi687FOkpsIH\nTrYzaaNxjf9hjMruABobgZBUT0owm0CIS4SstwIDAQABAoIBAQC+AtwoqDdFZOCQ\n90NjLOmWNymmcGdXE+5oNuzBHaeRCWeKd1Le/wVB9hk4a4BBPVJFUGq1stw4nhOk\nDCMjWIwXmTKFIyYlrUr3+IguVNklzCup7Rp+jSbCs6K4V6mQhiffP8ofYFqu24H/\nQ/OMbyjWUZgYyoGm+Xm2Ea1bZ78BMvksIK3EERFclFQMpk9/GRA//hx9yzPPjNVq\nT9JZuB0S8wHtQb41OmILUe5QS1i7UqrB+SucCkuYK/2IujdcGuAh49NztG1/RDtr\nl0P46bKQdVdb62oT1qNxI8fdq65C9/LVkuy/1J8H4Qxr1SyefGOE+d/JXEujVr0d\nukcAKn2RAoGBAPxSNRI5q6dmxWQYxQ6DTVHwdrLC8i5wGsv/xGaTnszeY7TkMifr\nVUD532wRINIJlUTG8rTK/zxBLy1nEUApiv17CWgwLCd/cmeMz/U7YdHdOQ4ij6J1\nmGdq4Bx1xjTKCxDcGB9sWDHWQZHjb8mRkdAM01ScmpBoAkooEQsJ7+cfAoGBAPTW\nR4fcBzYhjXqToWrKaBQnnFdlKGEhRTjrWAJkUElxBkmQY1QsX/tnZtHDmicv7my+\n2e1mmYMDxMwhxpq3mvNCFdSkL03ZIn8EbUbWCnFSEy0jxqoYjwXz61AH67wB4y+0\n8iK6MQu1XUxXaZNejR7qdsAhpZ25zAcmdRzVOf9pAoGBANhH3xXwOSMVBL34PXFj\nOzOxWw1/7PfBQDb81ezXPJd/SRgVQqjVIA7CILERPYDMlhaOMhympIGRnk7cufy1\nn14HyNh18mMo63e3S8p5TDAH4JAtL9Gh2zFKey/qBCvbxAB/qG3HARI3BZ13xqqR\nDNu5Iqy0UAjYHp5SGcnMischAoGBALdXTrFZ/rx2W6+SpamGcHHHR7faNGant2Js\nObdwzv5v+LlVukvp/uYQBFrIEsONjQk50Y+I6SPGyrPiBwsMuqe2sQpO+G1fUAm1\nku8ckS1SvLFsvPPa+B8JDQkdJVXgQ/QRl9CRhPCzm23zd0e34g1ongw6Jf76huJD\n1icFNS0hAoGBAMaEGO+CW8dxy5MXSoYMax2e18TyHQ1+OllNt6C+ssAA8opOBWTw\n6Szj5h88F4sB6OU1RYgCuIGEXfYkul3gC54hy1IVuyz56bYKYUrIphJ+GOzvEV3s\nK3wpJYdA4X1EONsVHVnC7ZlKM7sfbpKFF4MMEeKSDpvbf3X5IcmDTsPl\n-----END RSA PRIVATE KEY-----"
	publicKey := "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA8VGNznEjnNxvSxA1jPoT\nUElr4kOqkeDNkA7J12vjov80Q1MMSjST0kbUEsacLzJG3YooXOWK9/Mpjvp+iA64\nqEMVI+ki6hCaQI8xlD5JgTHXCvjz29zX4UsuK+V6cTKWuwk/wkxMu2pxA6p3oVvE\n3275PXlhvjku7u0j/LYeWxcuhAVAM3Ldwku9NO1uq1bjshlNhBfZpMF406lnUHCK\nyy4mPllilpUPe10oyGQK+7U5V4DeKvBIBTKhTr1BOwCLwKETzNS1wzDvmGvNCbJy\niGkwDeuHiEdh0fHDFi687FOkpsIHTrYzaaNxjf9hjMruABobgZBUT0owm0CIS4Ss\ntwIDAQAB\n-----END PUBLIC KEY-----"

	user.ServiceAccountPublicKey = &publicKey
	if _, err := a.db.UpdateUser(ctx, user); err != nil {
		t.Errorf("Update user failed with error %s", err.Error())
	}

	signKey, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(privateKey))
	if err != nil {
		t.Errorf("Parsing private key failed with error %s", err.Error())
	}

	currentTime := time.Now()
	exp := currentTime.Add(5 * time.Minute).Unix()
	jti := random.String(32)

	var flagtests = []struct {
		name           string
		sub            interface{}
		exp            interface{}
		jti            interface{}
		responseStatus int
		error          string
	}{
		{"correct token", user.Id, exp, jti, http.StatusOK, ""},
		{"missing sub", nil, exp, random.String(32), http.StatusUnauthorized, "authorization.apiKey.sub.missing"},
		{"wrong sub type", strconv.Itoa(user.Id), exp, random.String(32), http.StatusUnauthorized, "authorization.apiKey.sub.wrongType"},
		{"unknown sub", user.Id + 1, exp, random.String(32), http.StatusUnauthorized, "authorization.apiKey.sub.notFound"},
		{"missing exp", user.Id, nil, random.String(32), http.StatusUnauthorized, "authorization.apiKey.exp.missing"},
		{"wrong exp type", user.Id, strconv.FormatInt(exp, 10), random.String(32), http.StatusUnauthorized, "authorization.apiKey.exp.wrongType"},
		{"old exp", user.Id, currentTime.Add(-5 * time.Minute).Unix(), random.String(32), http.StatusUnauthorized, "authorization.apiKey.exp.expired"},
		{"too long exp", user.Id, currentTime.Add(60 * time.Minute).Unix(), random.String(32), http.StatusUnauthorized, "authorization.apiKey.exp.tooLong"},
		{"missing jti", user.Id, exp, nil, http.StatusUnauthorized, "authorization.apiKey.jti.missing"},
		{"wrong jti type", user.Id, exp, 12345, http.StatusUnauthorized, "authorization.apiKey.jti.wrongType"},
		{"wrong jti format", user.Id, exp, random.String(20), http.StatusUnauthorized, "authorization.apiKey.jti.invalid"},
		{"reused jti", user.Id, exp, jti, http.StatusUnauthorized, "authorization.apiKey.jti.reused"},
	}
	for _, tt := range flagtests {
		t.Run(tt.name, func(t *testing.T) {
			claims := jwt.MapClaims{}
			if tt.exp != nil {
				claims["exp"] = tt.exp
			}
			if tt.sub != nil {
				claims["sub"] = tt.sub
			}
			if tt.jti != nil {
				claims["jti"] = tt.jti
			}
			token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
			token.Header["alg"] = "RS256"
			token.Header["cty"] = "JWT"

			tokenString, err := token.SignedString(signKey)
			if err != nil {
				t.Errorf("Signing twt token failed with error %s", err.Error())
			}

			req, _ := http.NewRequest("GET", fmt.Sprintf("/users/%d", user.Id), nil)
			response := executeApiKeyRequest(req, tokenString)

			checkError(t, response, tt.responseStatus, tt.error)
		})
	}
}
