package app

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
	"github.com/gorilla/mux"

	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func getRequestedUserId(req *http.Request) (int, error) {
	vars := mux.Vars(req)
	requesterUserId := context.GetUserId(req.Context())

	requestedUserId, err := strconv.Atoi(vars["id"])
	if err != nil {
		return 0, UserError("id.invalid").WithCause(err)
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
		if _, ok := err.(*db.NotFoundError); ok {
			return handlerutil.NewNotFoundError("user.notFound")
		}
		return err
	}
	handlerutil.RespondWithJSON(res, http.StatusOK, user)
	return nil
}

type PatchUserRequest struct {
	ServiceAccountPublicKey *string `json:"serviceAccountPublicKey"`
	Email                   *string `json:"email"`
}

func (u *PatchUserRequest) Validate() error {
	err := validation.ValidateStruct(u,
		validation.Field(&u.Email, is.Email),
	)
	if err != nil {
		return err
	}
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
		return UserError("parsingError").WithCause(err)
	}

	if err := requestBody.Validate(); err != nil {
		return UserError("validation.failed").WithCause(err)
	}

	user, err := a.db.UpdateUser(req.Context(), &entity.User{
		Id:                      requestedUserId,
		ServiceAccountPublicKey: requestBody.ServiceAccountPublicKey,
		Email:                   requestBody.Email,
	})
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, user)
	return nil
}
