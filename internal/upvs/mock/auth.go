package upvsMock

import (
	"fmt"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"

	"github.com/slovak-egov/einvoice/pkg/handlerutil"
	"github.com/slovak-egov/einvoice/pkg/random"
)

func (a *App) handleLogin(res http.ResponseWriter, req *http.Request) error {
	callback := req.URL.Query().Get("callback")
	if callback == "" {
		return handlerutil.NewBadRequestError("params.callback.missing")
	}

	userClaims := jwt.MapClaims{
		"sub":  "rc://sk/8314451298_tisici_janko",
		"name": "Janko Tisíci",
		"jti":  random.String(32),
		"exp":  time.Now().Unix() + 120*60*1000,
		"scopes": []string{
			"sktalk/receive",
			"sktalk/receive_and_save_to_outbox",
			"sktalk/save_to_outbox",
		},
	}

	userToken := jwt.NewWithClaims(jwt.SigningMethodRS256, userClaims)
	userToken.Header["alg"] = "RS256"

	userTokenString, err := userToken.SignedString(a.OboTokenPrivate)
	if err != nil {
		return err
	}

	orgClaims := jwt.MapClaims{
		"sub":  "ico://sk/11190993",
		"name": "PO 190993",
		"jti":  random.String(32),
		"exp":  time.Now().Unix() + 120*60*1000,
		"scopes": []string{
			"sktalk/receive",
			"sktalk/receive_and_save_to_outbox",
			"sktalk/save_to_outbox",
		},
	}

	orgToken := jwt.NewWithClaims(jwt.SigningMethodRS256, orgClaims)
	userToken.Header["alg"] = "RS256"

	orgTokenString, err := orgToken.SignedString(a.OboTokenPrivate)
	if err != nil {
		return err
	}

	_, err = res.Write([]byte(fmt.Sprintf(
		"<!DOCTYPE html>"+
			"<html>"+
			"<body>"+
			"<ul>"+
			"<li><a href=\"%s?token=%s\">Janko Tisíci</a></li>"+
			"<li><a href=\"%s?token=%s\">PO 190993</a></li>"+
			"</ul>"+
			"</body>"+
			"</html>", callback, userTokenString, callback, orgTokenString)))

	return err
}

func (a *App) handleLogout(res http.ResponseWriter, req *http.Request) error {
	callback := req.URL.Query().Get("callback")
	if callback == "" {
		return handlerutil.NewBadRequestError("params.callback.missing")
	}

	http.Redirect(res, req, callback, http.StatusFound)

	return nil
}
