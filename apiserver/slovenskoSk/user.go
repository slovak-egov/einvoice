package slovenskoSk

import (
	goContext "context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/dgrijalva/jwt-go"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/random"
)

type User struct {
	Name string `json:"name"`
	Uri  string `json:"uri"`
}

func (c *Connector) GetUser(ctx goContext.Context, oboToken string) (*User, error) {
	token, err := jwt.Parse(oboToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return c.oboTokenPublic, nil
	})

	if !token.Valid {
		return nil, &InvalidTokenError{"Invalid token"}
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, &InvalidTokenError{"Cannot parse claims"}
	}

	slovenskoSkToken := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"exp": claims["exp"],
		"jti": random.String(32),
		"obo": oboToken,
	})
	slovenskoSkToken.Header["alg"] = "RS256"
	slovenskoSkToken.Header["cty"] = "JWT"
	delete(slovenskoSkToken.Header, "typ")

	slovenskoSkTokenString, err := slovenskoSkToken.SignedString(c.apiTokenPrivate)
	if err != nil {
		return nil, err
	}

	response, err := c.sendRequest(
		ctx,
		&Request{
			"GET",
			"/api/upvs/user/info",
			map[string]string{"Authorization": "Bearer "+slovenskoSkTokenString},
		},
	)
	if err != nil {
		return nil, err
	}

	user := &User{}
	if err = json.Unmarshal(response, user); err != nil {
		return nil, err
	}

	return user, nil
}

type Request struct {
	method  string
	url     string
	headers map[string]string
}

func (c *Connector) sendRequest(ctx goContext.Context, request *Request) ([]byte, error) {
	slovenskoSkReq, err := http.NewRequest(request.method, c.baseUrl + request.url, nil)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("slovenskosk.sendRequest.preparation.failed")
		return nil, err
	}

	for headerName, headerValue := range request.headers {
		slovenskoSkReq.Header.Add(headerName, headerValue)
	}

	slovenskoSkRes, err := c.client.Do(slovenskoSkReq)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("slovenskosk.sendRequest.failed")
		return nil, &UpvsError{err.Error()}
	}

	if slovenskoSkRes.StatusCode != http.StatusOK {
		context.GetLogger(ctx).
			WithField("status", slovenskoSkRes.StatusCode).
			Error("slovenskosk.sendRequest.errorStatusCode")

		return nil, &UpvsError{"UPVS responded with: " + slovenskoSkRes.Status}
	}

	defer slovenskoSkRes.Body.Close()

	body, err := ioutil.ReadAll(slovenskoSkRes.Body)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("slovenskosk.sendRequest.readResponse.failed")
		return nil, err
	}

	return body, nil
}
