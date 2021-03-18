package upvs

import (
	goContext "context"
	"fmt"
	"sync"

	"github.com/dgrijalva/jwt-go"
)

func (c *Connector) GetLogoutUrl(ctx goContext.Context, callbackUrl, oboToken string) (string, error) {
	signedOboToken, err := c.signOboToken(ctx, oboToken)
	if jwtError, ok := err.(*jwt.ValidationError); ok && jwtError.Errors == jwt.ValidationErrorExpired {
		// Skip úpvs logout if token is already invalid
		return callbackUrl, nil
	} else if err != nil {
		return "", err
	}

	return fmt.Sprintf(
		c.baseUrl+"/logout?token=%s&callback=%s",
		signedOboToken,
		callbackUrl,
	), nil
}

func (c *Connector) GetLoggedUserInfo(ctx goContext.Context, oboToken string) (*User, *SamlToken, error) {
	var user *User
	var saml *SamlToken
	var userErr, samlErr error
	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		user, userErr = c.GetUser(ctx, oboToken)
		wg.Done()
	}()
	go func() {
		saml, samlErr = c.GetSamlToken(ctx, oboToken)
		wg.Done()
	}()

	wg.Wait()

	if userErr != nil {
		return nil, nil, userErr
	}
	if samlErr != nil {
		return nil, nil, samlErr
	}

	return user, saml, nil
}
