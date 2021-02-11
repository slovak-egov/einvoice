package apiserver

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func getRequestedUserId(req *http.Request) (int, error) {
	vars := mux.Vars(req)
	requesterUserId := context.GetUserId(req.Context())

	requestedUserId, err := strconv.Atoi(vars["id"])
	if err != nil {
		return 0, UserError("id.invalid").WithDetail(err)
	}
	// Currently everyone can request only own data
	if requestedUserId != requesterUserId {
		return 0, UnauthorizedError
	}

	return requestedUserId, nil
}

func (a *App) getUser(res http.ResponseWriter, req *http.Request) error {
	requestedUserId, err := getRequestedUserId(req)
	if err != nil {
		return err
	}

	user, err := a.db.GetUser(req.Context(), requestedUserId)
	if err != nil {
		if _, ok := err.(*dbutil.NotFoundError); ok {
			return handlerutil.NewNotFoundError("user.notFound")
		}
		return err
	}
	handlerutil.RespondWithJSON(res, http.StatusOK, user)
	return nil
}

type PatchUserRequest struct {
	ServiceAccountPublicKey *string `json:"serviceAccountPublicKey"`
}

func (u *PatchUserRequest) Validate() error {
	if *u == (PatchUserRequest{}) {
		return errors.New("Body should not be empty")
	}
	return nil
}

func (a *App) updateUser(res http.ResponseWriter, req *http.Request) error {
	requestedUserId, err := getRequestedUserId(req)
	if err != nil {
		return err
	}

	var requestBody PatchUserRequest

	decoder := json.NewDecoder(req.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&requestBody); err != nil {
		return UserError("parsingError").WithDetail(err)
	}

	if err := requestBody.Validate(); err != nil {
		return UserError("validation.failed").WithDetail(err)
	}

	user, err := a.db.UpdateUser(req.Context(), &entity.User{
		Id:                      requestedUserId,
		ServiceAccountPublicKey: requestBody.ServiceAccountPublicKey,
	})
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, user)
	return nil
}
