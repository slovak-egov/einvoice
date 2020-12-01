package app

import (
	"errors"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/slovak-egov/einvoice/apiserver/db"
	myErrors "github.com/slovak-egov/einvoice/apiserver/errors"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) getInvoices(res http.ResponseWriter, req *http.Request) {
	formats := req.URL.Query()["format"]

	invoices, err := a.db.GetInvoices(req.Context(), formats)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, invoices)
}

func (a *App) getInvoice(res http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, "ID should be integer")
		return
	}

	invoice, err := a.db.GetInvoice(req.Context(), id)
	if errors.As(err, &myErrors.NotFound{}) {
		handlerutil.RespondWithError(res, http.StatusNotFound, "Invoice was not found")
		return
	} else if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, invoice)
}

func (a *App) getInvoiceDetail(res http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, "ID should be an integer")
		return
	}

	invoice, err := a.storage.GetInvoice(req.Context(), id)
	if errors.As(err, &myErrors.NotFound{}) {
		handlerutil.RespondWithError(res, http.StatusNotFound, "Invoice was not found")
		return
	} else if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	res.Header().Set("Content-Type", "application/xml")
	res.WriteHeader(http.StatusOK)
	res.Write(invoice)
}

func NewUserInvoicesOptions(params url.Values) *db.UserInvoicesOptions {
	return &db.UserInvoicesOptions{
		params.Get("received") == "true",
		params.Get("supplied") == "true",
		params["ico"],
		params["format"],
	}
}

func (a *App) getUserInvoices(res http.ResponseWriter, req *http.Request) {
	requestedUserId, status, errorMessage := getRequestedUserId(req)

	if errorMessage != "" {
		handlerutil.RespondWithError(res, status, errorMessage)
		return
	}

	requestOptions := NewUserInvoicesOptions(req.URL.Query())

	if err := requestOptions.Validate(); err != nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
		return
	}

	invoices, err := a.db.GetUserInvoices(req.Context(), requestedUserId, requestOptions)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, invoices)
}
