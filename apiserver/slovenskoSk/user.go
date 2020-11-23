package slovenskoSk

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/random"
)

type User struct {
	Name string `json:"name"`
	Uri  string `json:"uri"`
}

func (connector *Connector) GetUser(oboToken string) (*User, error) {
	token, err := jwt.Parse(oboToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return connector.oboTokenPublic, nil
	})

	if !token.Valid {
		return nil, errors.New("Invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("Cannot parse claims")
	}

	slovenskoSkToken := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"exp": claims["exp"],
		"jti": random.String(32),
		"obo": oboToken,
	})
	slovenskoSkToken.Header["alg"] = "RS256"
	slovenskoSkToken.Header["cty"] = "JWT"
	delete(slovenskoSkToken.Header, "typ")

	slovenskoSkTokenString, err := slovenskoSkToken.SignedString(connector.apiTokenPrivate)
	if err != nil {
		return nil, err
	}

	client := &http.Client{}
	slovenskoSkReq, err := http.NewRequest("GET", connector.baseUrl + "/api/upvs/user/info", nil)
	if err != nil {
		log.WithField("error", err.Error()).Error("slovenskosk.getUser.requestPreparation.failed")
		return nil, err
	}
	slovenskoSkReq.Header.Add("Authorization", "Bearer "+slovenskoSkTokenString)
	slovenskoSkRes, err := client.Do(slovenskoSkReq)
	if err != nil {
		log.WithField("error", err.Error()).Error("slovenskosk.getUser.request.failed")
		return nil, err
	}

	defer slovenskoSkRes.Body.Close()
	body, err := ioutil.ReadAll(slovenskoSkRes.Body)
	if err != nil {
		log.WithField("error", err.Error()).Error("slovenskosk.getUser.requestBodyRead.failed")
		return nil, err
	}

	user := &User{}
	if err = json.Unmarshal(body, user); err != nil {
		return nil, err
	}

	if user.Uri == "" {
		return nil, errors.New("Unauthorized")
	}

	return user, nil
}
