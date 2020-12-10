package app

import (
	"encoding/json"
	"net/http"

	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) getUserSubstitutes(res http.ResponseWriter, req *http.Request) error {
	requestedUserId, err := getRequestedUserId(req)
	if err != nil {
		return err
	}

	substituteIds, err := a.db.GetUserSubstitutes(req.Context(), requestedUserId)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, substituteIds)
	return nil
}

func (a *App) getUserOrganizations(res http.ResponseWriter, req *http.Request) error {
	requestedUserId, err := getRequestedUserId(req)
	if err != nil {
		return err
	}

	icos, err := a.db.GetUserOrganizations(req.Context(), requestedUserId)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, icos)
	return nil
}

func (a *App) addUserSubstitutes(res http.ResponseWriter, req *http.Request) error {
	requestedUserId, err := getRequestedUserId(req)
	if err != nil {
		return err
	}

	var requestBody []int

	decoder := json.NewDecoder(req.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&requestBody); err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}

	if len(requestBody) == 0 {
		return handlerutil.NewBadRequestError("You should add at least 1 substitute")
	}

	substituteIds, err := a.db.AddUserSubstitutes(req.Context(), requestedUserId, requestBody)
	if _, ok := err.(*db.IntegrityViolationError); ok {
		return handlerutil.NewBadRequestError(err.Error())
	} else if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, substituteIds)
	return nil
}

func (a *App) removeUserSubstitutes(res http.ResponseWriter, req *http.Request) error {
	requestedUserId, err := getRequestedUserId(req)
	if err != nil {
		return err
	}

	var requestBody []int

	decoder := json.NewDecoder(req.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&requestBody); err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}

	if len(requestBody) == 0 {
		return handlerutil.NewBadRequestError("You should remove at least 1 substitute")
	}

	substituteIds, err := a.db.RemoveUserSubstitutes(req.Context(), requestedUserId, requestBody)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, substituteIds)
	return nil
}
