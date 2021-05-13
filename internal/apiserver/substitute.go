package apiserver

import (
	"encoding/json"
	"errors"
	"net/http"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
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

	icos, err := a.db.GetUserOrganizationIds(req.Context(), requestedUserId)
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
		return SubstituteError("body.parsingError").WithDetail(err)
	}

	if len(requestBody) == 0 {
		return SubstituteError("body.empty")
	}

	substituteIds, err := a.db.AddUserSubstitutes(req.Context(), requestedUserId, requestBody)
	if _, ok := err.(*dbutil.IntegrityViolationError); ok {
		return SubstituteError("create.failed").WithDetail(errors.New("Substitute already set"))
	} else if err != nil {
		return err
	}

	context.GetLogger(req.Context()).WithFields(log.Fields{
		"userId":        requestedUserId,
		"substituteIds": requestBody,
	}).Info("substitute.add")

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
		return SubstituteError("body.parsingError").WithDetail(err)
	}

	if len(requestBody) == 0 {
		return SubstituteError("body.empty")
	}

	substituteIds, err := a.db.RemoveUserSubstitutes(req.Context(), requestedUserId, requestBody)
	if err != nil {
		return err
	}

	context.GetLogger(req.Context()).WithFields(log.Fields{
		"userId":        requestedUserId,
		"substituteIds": requestBody,
	}).Info("substitute.delete")

	handlerutil.RespondWithJSON(res, http.StatusOK, substituteIds)
	return nil
}
