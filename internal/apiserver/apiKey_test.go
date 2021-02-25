package apiserver

import (
	"fmt"
	"net/http"
	"strconv"
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"

	"github.com/slovak-egov/einvoice/internal/testutil"
)

func TestApiKey(t *testing.T) {
	// Fill DB
	t.Cleanup(testutil.CleanDb(ctx, t, a.db.Connector))
	user := testutil.CreateUser(ctx, t, a.db.Connector, "")

	privateKey := testutil.TestPrivateKey
	publicKey := testutil.TestPublicKey

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
	jti := uuid.New().String()

	var flagtests = []struct {
		name           string
		sub            interface{}
		exp            interface{}
		jti            interface{}
		responseStatus int
		error          string
	}{
		{"correct token", user.Id, exp, jti, http.StatusOK, ""},
		{"missing sub", nil, exp, uuid.New().String(), http.StatusUnauthorized, "authorization.apiKey.sub.missing"},
		{"wrong sub type", strconv.Itoa(user.Id), exp, uuid.New().String(), http.StatusUnauthorized, "authorization.apiKey.sub.wrongType"},
		{"unknown sub", user.Id + 1, exp, uuid.New().String(), http.StatusUnauthorized, "authorization.apiKey.sub.notFound"},
		{"missing exp", user.Id, nil, uuid.New().String(), http.StatusUnauthorized, "authorization.apiKey.exp.missing"},
		{"wrong exp type", user.Id, strconv.FormatInt(exp, 10), uuid.New().String(), http.StatusUnauthorized, "authorization.apiKey.exp.wrongType"},
		{"old exp", user.Id, currentTime.Add(-5 * time.Minute).Unix(), uuid.New().String(), http.StatusUnauthorized, "authorization.apiKey.exp.expired"},
		{"too long exp", user.Id, currentTime.Add(60 * time.Minute).Unix(), uuid.New().String(), http.StatusUnauthorized, "authorization.apiKey.exp.tooLong"},
		{"missing jti", user.Id, exp, nil, http.StatusUnauthorized, "authorization.apiKey.jti.missing"},
		{"wrong jti type", user.Id, exp, 12345, http.StatusUnauthorized, "authorization.apiKey.jti.wrongType"},
		{"wrong jti format", user.Id, exp, "12345", http.StatusUnauthorized, "authorization.apiKey.jti.invalid"},
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
				t.Errorf("Signing jwt token failed with error %s", err.Error())
			}

			req, err := http.NewRequest("GET", fmt.Sprintf("/users/%d", user.Id), nil)
			if err != nil {
				t.Error(err.Error())
			}
			response := testutil.ExecuteApiKeyRequest(a, req, tokenString)

			testutil.CheckError(t, response, tt.responseStatus, tt.error)
		})
	}
}
