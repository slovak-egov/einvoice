package apiserver

import (
	"net/http"

	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/upvs"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) handleLogin(res http.ResponseWriter, req *http.Request) error {
	ctx := req.Context()

	oboToken, err := GetAuthToken(req)
	if err != nil {
		return err
	} else if oboToken.Type != BearerToken {
		return AuthInvalidTypeError
	}

	upvsUser, samlToken, err := a.upvs.GetLoggedUserInfo(ctx, oboToken.Value)
	if _, ok := err.(*upvs.InvalidTokenError); ok {
		return UnauthorizedError
	} else if _, ok := err.(*upvs.UpvsError); ok {
		return UpvsError("request.failed")
	} else if err != nil {
		return err
	}

	// Only executive manager can log in as company
	if samlToken.ActorUPVSIdentityID != samlToken.SubjectUPVSIdentityID && samlToken.DelegationType != 0 {
		return handlerutil.NewForbiddenError("authorization.upvs.forbiddenSubstitutionType")
	}

	user, err := a.db.GetOrCreateUser(ctx, upvsUser.Uri, upvsUser.Name)
	if err != nil {
		return err
	}

	sessionToken := uuid.New().String()
	err = a.cache.SaveUserToken(ctx, sessionToken, user.Id)
	if err != nil {
		return err
	}

	context.GetLogger(ctx).WithFields(log.Fields{
		"userId":  user.Id,
		"upvsUri": user.UpvsUri,
	}).Info("login")

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

	logoutUrl, err := a.upvs.GetLogoutUrl(req.Context(), req.URL.Query().Get("callback"), oboToken.Value)
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

	userId, err := a.cache.GetUserId(req.Context(), token.Value)
	if err != nil {
		return err
	}

	err = a.cache.RemoveUserToken(req.Context(), token.Value)
	if err != nil {
		return err
	}

	context.GetLogger(req.Context()).WithFields(log.Fields{
		"userId": userId,
	}).Info("logout")

	handlerutil.RespondWithJSON(res, http.StatusOK, map[string]string{"logout": "successful"})
	return nil
}
