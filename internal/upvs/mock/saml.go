package upvsMock

import (
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"

	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

var usersSaml = map[string]string{
	"rc://sk/8314451298_tisici_janko": "./internal/upvs/mock/data/samlJankoTisici.xml",
	"ico://sk/11190993":               "./internal/upvs/mock/data/samlPO190993.xml",
}

func (a *App) handleSaml(res http.ResponseWriter, req *http.Request) error {
	header := req.Header.Get("Authorization")
	parts := strings.Split(header, " ")

	if header == "" || len(parts) != 2 {
		return handlerutil.NewAuthorizationError("unauthorized")
	}
	apiTokenString := parts[1]

	apiToken, err := jwt.Parse(apiTokenString, func(token *jwt.Token) (interface{}, error) {
		return a.ApiTokenPublic, nil
	})

	if err != nil {
		return handlerutil.NewAuthorizationError("apiToken.parseToken.failed")
	}

	if !apiToken.Valid {
		return handlerutil.NewAuthorizationError("apiToken.invalid")
	}

	ApiClaims, ok := apiToken.Claims.(jwt.MapClaims)
	if !ok {
		return handlerutil.NewAuthorizationError("apiToken.claims.invalid")
	}

	oboTokenString, ok := ApiClaims["obo"].(string)
	if !ok {
		return handlerutil.NewAuthorizationError("apiToken.claims.obo.missing")
	}

	oboToken, err := jwt.Parse(oboTokenString, func(token *jwt.Token) (interface{}, error) {
		return a.OboTokenPublic, nil
	})

	if err != nil {
		return handlerutil.NewAuthorizationError("oboToken.parseToken.failed")
	}

	if !oboToken.Valid {
		return handlerutil.NewAuthorizationError("oboToken.invalid")
	}

	oboClaims, ok := oboToken.Claims.(jwt.MapClaims)
	if !ok {
		return handlerutil.NewAuthorizationError("oboToken.claims.invalid")
	}

	sub := oboClaims["sub"].(string)
	userFile, ok := usersSaml[sub]
	if !ok {
		return handlerutil.NewAuthorizationError("user.unknown")
	}

	data, err := ioutil.ReadFile(userFile)
	if err != nil {
		return err
	}

	_, err = res.Write(data)
	return err
}
