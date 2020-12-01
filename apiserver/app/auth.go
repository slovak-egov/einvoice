package app

import (
	"errors"
	"net/http"

	"github.com/google/uuid"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	myErrors "github.com/slovak-egov/einvoice/apiserver/errors"
	"github.com/slovak-egov/einvoice/apiserver/slovenskoSk"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) handleLogin(res http.ResponseWriter, req *http.Request) {
	oboToken, err := GetAuthToken(req)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, err.Error())
		return
	} else if oboToken.Type != BearerToken {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, "Token should be in Bearer format")
		return
	}

	slovenskoSkUser, err := a.slovenskoSk.GetUser(req.Context(), oboToken.Value)
	if errors.As(err, &slovenskoSk.InvalidTokenError{}) {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, "Unauthorized")
		return
	} else if errors.As(err, &slovenskoSk.UpvsError{}) {
		handlerutil.RespondWithError(res, http.StatusFailedDependency, err.Error())
		return
	} else if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	user, err := a.db.GetOrCreateUser(req.Context(), slovenskoSkUser.Uri, slovenskoSkUser.Name)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	sessionToken := uuid.New().String()
	err = a.cache.SaveUserToken(req.Context(), sessionToken, user.Id)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, struct {
		Token string `json:"token"`
		*entity.User
	}{sessionToken, user})
}

func (a *App) handleLogout(res http.ResponseWriter, req *http.Request) {
	token, err := GetAuthToken(req)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, err.Error())
		return
	} else if token.Type != BearerToken {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, "No Bearer token provided")
		return
	}

	err = a.cache.RemoveUserToken(req.Context(), token.Value)
	if errors.As(err, &myErrors.NotFound{}) {
		handlerutil.RespondWithError(res, http.StatusUnauthorized, "User not logged in")
		return
	} else if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, map[string]string{"logout": "successful"})
}
