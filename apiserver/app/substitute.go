package app

import (
	"encoding/json"
	"net/http"

	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) getUserSubstitutes(res http.ResponseWriter, req *http.Request) {
	requestedUserId, status, errorMessage := getRequestedUserId(req)

	if errorMessage != "" {
		handlerutil.RespondWithError(res, status, errorMessage)
		return
	}

	substituteIds, err := a.db.GetUserSubstitutes(requestedUserId)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, substituteIds)
}

func (a *App) addUserSubstitutes(res http.ResponseWriter, req *http.Request) {
	requestedUserId, status, errorMessage := getRequestedUserId(req)

	if errorMessage != "" {
		handlerutil.RespondWithError(res, status, errorMessage)
		return
	}

	var requestBody []int

	decoder := json.NewDecoder(req.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&requestBody); err != nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
		return
	}

	if len(requestBody) == 0 {
		handlerutil.RespondWithError(res, http.StatusBadRequest, "You should add at least 1 substitute")
		return
	}

	substituteIds, err := a.db.AddUserSubstitutes(requestedUserId, requestBody)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	} else if substituteIds == nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, "Some of substitutes do not exist")
		return
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, substituteIds)
}

func (a *App) removeUserSubstitutes(res http.ResponseWriter, req *http.Request) {
	requestedUserId, status, errorMessage := getRequestedUserId(req)

	if errorMessage != "" {
		handlerutil.RespondWithError(res, status, errorMessage)
		return
	}

	var requestBody []int

	decoder := json.NewDecoder(req.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&requestBody); err != nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
		return
	}

	if len(requestBody) == 0 {
		handlerutil.RespondWithError(res, http.StatusBadRequest, "You should remove at least 1 substitute")
		return
	}

	substituteIds, err := a.db.RemoveUserSubstitutes(requestedUserId, requestBody)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, substituteIds)
}

