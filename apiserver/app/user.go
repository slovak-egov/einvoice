package app

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-ozzo/ozzo-validation/v4"
	"github.com/go-ozzo/ozzo-validation/v4/is"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func getRequestedUserId(req *http.Request) (int, int, string) {
	vars := mux.Vars(req)
	requesterUserId, err := strconv.Atoi(req.Header.Get("User-Id"))
	if err != nil {
		log.WithField("error", err.Error()).Error("app.requesterUserId.invalid")
		return 0, http.StatusInternalServerError, "Something went wrong"
	}
	requestedUserId, err := strconv.Atoi(vars["id"])
	if err != nil {
		return 0, http.StatusBadRequest, "User id should be int"
	}
	// Currently everyone can request only own data
	if requestedUserId != requesterUserId {
		return 0, http.StatusUnauthorized, "Unauthorized"
	}

	return requestedUserId, 0, ""
}

func (a *App) getUser(res http.ResponseWriter, req *http.Request) {
	requestedUserId, status, errorMessage := getRequestedUserId(req)

	if errorMessage != "" {
		handlerutil.RespondWithError(res, status, errorMessage)
		return
	}

	user, err := a.db.GetUser(requestedUserId)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}
	handlerutil.RespondWithJSON(res, http.StatusOK, user)
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

func (a *App) updateUser(res http.ResponseWriter, req *http.Request) {
	requestedUserId, status, errorMessage := getRequestedUserId(req)

	if errorMessage != "" {
		handlerutil.RespondWithError(res, status, errorMessage)
		return
	}

	var requestBody PatchUserRequest

	decoder := json.NewDecoder(req.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&requestBody); err != nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
		return
	}

	if err := requestBody.Validate(); err != nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
		return
	}

	user := a.db.UpdateUser(&entity.User{
		Id:                      requestedUserId,
		ServiceAccountPublicKey: requestBody.ServiceAccountPublicKey,
		Email:                   requestBody.Email,
	})

	handlerutil.RespondWithJSON(res, http.StatusOK, user)
}
