package upvs

import (
	goContext "context"
	"encoding/json"
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
		&request{
			method:  "GET",
			url:     "/api/upvs/identity",
			headers: map[string]string{"Authorization": "Bearer " + signedOboToken},
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
