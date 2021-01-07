package app

import (
	"net/http"

	"github.com/google/uuid"

	"github.com/slovak-egov/einvoice/apiserver/slovenskoSk"
	"github.com/slovak-egov/einvoice/pkg/entity"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) handleLogin(res http.ResponseWriter, req *http.Request) error {
	oboToken, err := GetAuthToken(req)
	if err != nil {
		return err
	} else if oboToken.Type != BearerToken {
		return AuthInvalidTypeError
	}

	slovenskoSkUser, err := a.slovenskoSk.GetUser(req.Context(), oboToken.Value)
	if _, ok := err.(*slovenskoSk.InvalidTokenError); ok {
		return UnauthorizedError
	} else if _, ok := err.(*slovenskoSk.UpvsError); ok {
		return SlovenskoSkError("request.failed")
	} else if err != nil {
		return err
	}

	user, err := a.db.GetOrCreateUser(req.Context(), slovenskoSkUser.Uri, slovenskoSkUser.Name)
	if err != nil {
		return err
	}

	sessionToken := uuid.New().String()
	err = a.cache.SaveUserToken(req.Context(), sessionToken, user.Id)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, struct {
		Token string `json:"token"`
		*entity.User
	}{sessionToken, user})
	return nil
}

func (a *App) handleUpvsLogout(res http.ResponseWriter, req *http.Request) error {
	oboToken, err := GetAuthToken(req)
	if err != nil {
		return err
	} else if oboToken.Type != BearerToken {
		return AuthInvalidTypeError
	}

	logoutUrl, err := a.slovenskoSk.GetLogoutUrl(req.Context(), oboToken.Value)
	if err != nil {
		return UnauthorizedError
	}

	http.Redirect(res, req, logoutUrl, http.StatusFound)

	return nil
}

func (a *App) handleLogout(res http.ResponseWriter, req *http.Request) error {
	token, err := GetAuthToken(req)
	if err != nil {
		return err
	} else if token.Type != BearerToken {
		return AuthInvalidTypeError
	}

	err = a.cache.RemoveUserToken(req.Context(), token.Value)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, map[string]string{"logout": "successful"})
	return nil
}
