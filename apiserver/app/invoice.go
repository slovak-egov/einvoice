package app

import (
	"net/http"
	"net/url"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/apiserver/pdf"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) getPublicInvoices(res http.ResponseWriter, req *http.Request) error {
	formats := req.URL.Query()["format"]

	invoices, err := a.db.GetInvoices(req.Context(), formats)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, invoices)
	return nil
}

func (a *App) getInvoice(res http.ResponseWriter, req *http.Request) error {
	vars := mux.Vars(req)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return handlerutil.NewBadRequestError("ID should be an integer")
	}

	invoice, err := a.db.GetInvoice(req.Context(), id)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, invoice)
	return nil
}

func (a *App) getInvoiceXml(res http.ResponseWriter, req *http.Request) error {
	vars := mux.Vars(req)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return handlerutil.NewBadRequestError("ID should be an integer")
	}

	invoice, err := a.storage.GetInvoice(req.Context(), id)
	if err != nil {
		return err
	}

	res.Header().Set("Content-Type", "application/xml")
	res.Header().Set("Content-Disposition", "attachment; filename=invoice-"+vars["id"]+".xml")
	res.WriteHeader(http.StatusOK)
	res.Write(invoice)
	return nil
}

func (a *App) getInvoicePdf(res http.ResponseWriter, req *http.Request) error {
	vars := mux.Vars(req)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return handlerutil.NewBadRequestError("ID should be an integer")
	}

	invoice, err := a.db.GetInvoice(req.Context(), id)
	if err != nil {
		return err
	}

	pdfFile, err := pdf.Generate(invoice)
	if err != nil {
		return err
	}

	res.Header().Set("Content-Type", "application/pdf")
	res.Header().Set("Content-Disposition", "attachment; filename=invoice-"+vars["id"]+".pdf")
	res.WriteHeader(http.StatusOK)
	pdfFile.Write(res)
	return nil
}

func NewUserInvoicesOptions(params url.Values) *db.UserInvoicesOptions {
	return &db.UserInvoicesOptions{
		params.Get("received") == "true",
		params.Get("supplied") == "true",
		params["ico"],
		params["format"],
	}
}

func (a *App) getUserInvoices(res http.ResponseWriter, req *http.Request) error {
	requestedUserId, err := getRequestedUserId(req)
	if err != nil {
		return err
	}

	requestOptions := NewUserInvoicesOptions(req.URL.Query())

	if err := requestOptions.Validate(); err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}

	invoices, err := a.db.GetUserInvoices(req.Context(), requestedUserId, requestOptions)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, invoices)
	return nil
}
