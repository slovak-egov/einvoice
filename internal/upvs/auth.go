package upvs

import (
	goContext "context"
	"fmt"

	"github.com/dgrijalva/jwt-go"
)

func (c *Connector) GetLogoutUrl(ctx goContext.Context, oboToken string) (string, error) {
	signedOboToken, err := c.signOboToken(ctx, oboToken)
	if jwtError, ok := err.(*jwt.ValidationError); ok && jwtError.Errors == jwt.ValidationErrorExpired {
		// Skip úpvs logout if token is already invalid
		return c.logoutCallbackUrl, nil
	} else if err != nil {
		return "", err
	}

	return fmt.Sprintf(
		c.baseUrl +"/logout?token=%s&callback=%s",
		signedOboToken,
		c.logoutCallbackUrl,
	), nil
}
