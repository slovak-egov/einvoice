package app

import (
	"net/http"
	"net/url"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) getInvoices(w http.ResponseWriter, r *http.Request) {
	formats := r.URL.Query()["format"]

	invoices := a.db.GetInvoices(formats)

	handlerutil.RespondWithJSON(w, http.StatusOK, invoices)
}

func (a *App) getInvoice(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		handlerutil.RespondWithError(w, http.StatusBadRequest, "ID should be integer")
		return
	}

	invoice := a.db.GetInvoice(id)
	if invoice == nil {
		handlerutil.RespondWithError(w, http.StatusNotFound, "Invoice was not found")
		return
	}

	handlerutil.RespondWithJSON(w, http.StatusOK, invoice)
}

func (a *App) getInvoiceDetail(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		handlerutil.RespondWithError(w, http.StatusBadRequest, "ID should be integer")
		return
	}

	invoice := a.storage.GetInvoice(id)
	if invoice == nil {
		handlerutil.RespondWithError(w, http.StatusNotFound, "Invoice was not found")
		return
	}

	w.Header().Set("Content-Type", "application/xml")
	w.WriteHeader(http.StatusOK)
	w.Write(invoice)
}

func NewUserInvoicesOptions(params url.Values) *db.UserInvoicesOptions {
	return &db.UserInvoicesOptions{
		params.Get("received") == "true",
		params.Get("supplied") == "true",
		params["ico"],
		params["format"],
	}
}

func (a *App) getUserInvoices(w http.ResponseWriter, r *http.Request) {
	requestedUserId, status, errorMessage := getRequestedUserId(r)

	if errorMessage != "" {
		handlerutil.RespondWithError(w, status, errorMessage)
		return
	}

	requestOptions := NewUserInvoicesOptions(r.URL.Query())

	if err := requestOptions.Validate(); err != nil {
		handlerutil.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	invoices := a.db.GetUserInvoices(requestedUserId, requestOptions)

	handlerutil.RespondWithJSON(w, http.StatusOK, invoices)
}
