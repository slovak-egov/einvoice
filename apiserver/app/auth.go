package app

import (
	"net/http"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
	"github.com/slovak-egov/einvoice/pkg/random"
)

func (a *App) handleLogin(res http.ResponseWriter, req *http.Request) {
	oboToken, err := GetAuthToken(req)
	if err != nil || oboToken.Type != BearerToken {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, err.Error())
		return
	}
	slovenskoSkUser, err := a.slovenskoSk.GetUser(oboToken.Value)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, "Unauthorized")
		return
	}

	uri := slovenskoSkUser.Uri

	// TODO: SELECT or INSERT query
	user, err := a.db.GetSlovenskoSkUser(uri)
	if user == nil {
		user, err = a.db.CreateUser(uri, slovenskoSkUser.Name)
	}

	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	sessionToken := random.String(50)
	a.cache.SaveUserToken(sessionToken, user.Id)

	handlerutil.RespondWithJSON(res, http.StatusOK, struct {
		Token string `json:"token"`
		*entity.User
	}{sessionToken, user})
}

func (a *App) handleLogout(res http.ResponseWriter, req *http.Request) {
	token, err := GetAuthToken(req)
	if err != nil || token.Type != BearerToken {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, err.Error())
		return
	}

	err = a.cache.RemoveUserToken(token.Value)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, "Unauthorized")
		return
	}
	handlerutil.RespondWithJSON(res, http.StatusOK, map[string]string{"logout": "successful"})
}
