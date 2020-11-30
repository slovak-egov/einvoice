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
	slovenskoSkUser, err := a.slovenskoSk.GetUser(req.Context(), oboToken.Value)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := a.db.GetOrCreateUser(req.Context(), slovenskoSkUser.Uri, slovenskoSkUser.Name)

	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	sessionToken := random.String(50)
	a.cache.SaveUserToken(req.Context(), sessionToken, user.Id)

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

	err = a.cache.RemoveUserToken(req.Context(), token.Value)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, "Unauthorized")
		return
	}
	handlerutil.RespondWithJSON(res, http.StatusOK, map[string]string{"logout": "successful"})
}
