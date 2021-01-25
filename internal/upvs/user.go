package upvs

import (
	goContext "context"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/slovak-egov/einvoice/pkg/context"
)

type User struct {
	Name string `json:"name"`
	Uri  string `json:"uri"`
}

func (c *Connector) GetUser(ctx goContext.Context, oboToken string) (*User, error) {
	signedOboToken, err := c.signOboToken(ctx, oboToken)
	if err != nil {
		return nil, err
	}

	response, err := c.sendRequest(
		ctx,
		&Request{
			"GET",
			"/api/upvs/user/info",
			map[string]string{"Authorization": "Bearer "+signedOboToken},
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
	upvsReq, err := http.NewRequest(request.method, c.baseUrl + request.url, nil)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("upvs.sendRequest.preparation.failed")
		return nil, err
	}

	for headerName, headerValue := range request.headers {
		upvsReq.Header.Add(headerName, headerValue)
	}

	upvsRes, err := c.client.Do(upvsReq)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("upvs.sendRequest.failed")
		return nil, &UpvsError{err.Error()}
	}

	if upvsRes.StatusCode != http.StatusOK {
		context.GetLogger(ctx).
			WithField("status", upvsRes.StatusCode).
			Error("upvs.sendRequest.errorStatusCode")

		return nil, &UpvsError{"UPVS responded with: " + upvsRes.Status}
	}

	defer upvsRes.Body.Close()

	body, err := ioutil.ReadAll(upvsRes.Body)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("upvs.sendRequest.readResponse.failed")
		return nil, err
	}

	return body, nil
}
