package app

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

type PagedInvoices struct {
	Invoices []entity.Invoice `json:"invoices"`
	NextId   *int             `json:"nextId"`
}

func NewPagedInvoices(invoices []entity.Invoice, limit int) *PagedInvoices {
	if len(invoices) > limit {
		return &PagedInvoices{invoices[:limit], &invoices[limit].Id}
	} else {
		return &PagedInvoices{invoices, nil}
	}
}

func NewPublicInvoicesOptions(params url.Values, maxLimit int) (*db.PublicInvoicesOptions, error) {
	nextId, err := getOptionalInt(params.Get("nextId"), 0)
	if err != nil {
		return nil, fmt.Errorf("nextId: %w", err)
	}
	limit, err := getOptionalInt(params.Get("limit"), maxLimit)
	if err != nil {
		return nil, fmt.Errorf("limit: %w", err)
	}
	return &db.PublicInvoicesOptions{
		params["format"],
		nextId,
		limit,
	}, nil
}

func (a *App) getPublicInvoices(res http.ResponseWriter, req *http.Request) error {
	requestOptions, err := NewPublicInvoicesOptions(req.URL.Query(), a.config.InvoicesLimit)
	if err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}

	if err := requestOptions.Validate(a.config.InvoicesLimit); err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}

	invoices, err := a.db.GetInvoices(req.Context(), requestOptions)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, NewPagedInvoices(invoices, requestOptions.Limit))
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

func (a *App) getInvoiceDetail(res http.ResponseWriter, req *http.Request) error {
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

func NewUserInvoicesOptions(userId int, params url.Values, maxLimit int) (*db.UserInvoicesOptions, error) {
	publicInvoicesOptions, err := NewPublicInvoicesOptions(params, maxLimit)
	if err != nil {
		return nil, err
	}
	return &db.UserInvoicesOptions{
		userId,
		params.Get("received") == "true",
		params.Get("supplied") == "true",
		params["ico"],
		publicInvoicesOptions,
	}, nil
}

func (a *App) getUserInvoices(res http.ResponseWriter, req *http.Request) error {
	requestedUserId, err := getRequestedUserId(req)
	if err != nil {
		return err
	}

	requestOptions, err := NewUserInvoicesOptions(requestedUserId, req.URL.Query(), a.config.InvoicesLimit)
	if err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}

	if err := requestOptions.Validate(a.config.InvoicesLimit); err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}

	invoices, err := a.db.GetUserInvoices(req.Context(), requestOptions)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, NewPagedInvoices(invoices, requestOptions.Limit))
	return nil
}
