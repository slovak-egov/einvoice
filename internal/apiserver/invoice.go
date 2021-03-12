package apiserver

import (
	goContext "context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/slovak-egov/einvoice/internal/apiserver/visualization"
	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/storage"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
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
	startId, err := getOptionalInt(params.Get("startId"), 0)
	if err != nil {
		return nil, fmt.Errorf("startId: %w", err)
	}
	limit, err := getOptionalInt(params.Get("limit"), maxLimit)
	if err != nil {
		return nil, fmt.Errorf("limit: %w", err)
	}
	test, err := getOptionalBool(params.Get("test"), false)
	if err != nil {
		return nil, fmt.Errorf("test: %w", err)
	}
	order := params.Get("order")
	if order == "" {
		order = dbutil.DescOrder
	}
	amountFrom, err := getOptionalFloat(params.Get("amountFrom"))
	if err != nil {
		return nil, fmt.Errorf("amountFrom: %w", err)
	}
	amountTo, err := getOptionalFloat(params.Get("amountTo"))
	if err != nil {
		return nil, fmt.Errorf("amountTo: %w", err)
	}
	amountWithoutVatFrom, err := getOptionalFloat(params.Get("amountWithoutVatFrom"))
	if err != nil {
		return nil, fmt.Errorf("amountWithoutVatFrom: %w", err)
	}
	amountWithoutVatTo, err := getOptionalFloat(params.Get("amountWithoutVatTo"))
	if err != nil {
		return nil, fmt.Errorf("amountWithoutVatTo: %w", err)
	}
	return &db.PublicInvoicesOptions{
		Formats: params["format"],
		StartId: startId,
		Limit:   limit,
		Test:    test,
		Ico:     params.Get("ico"),
		Order:   order,
		Amount: db.AmountOptions{
			From: amountFrom,
			To:   amountTo,
		},
		AmountWithoutVat: db.AmountOptions{
			From: amountWithoutVatFrom,
			To:   amountWithoutVatTo,
		},
	}, nil
}

func (a *App) getPublicInvoices(res http.ResponseWriter, req *http.Request) error {
	requestOptions, err := NewPublicInvoicesOptions(req.URL.Query(), a.config.InvoicesLimit)
	if err != nil {
		return InvoiceError("params.parsingError").WithDetail(err)
	}

	if err := requestOptions.Validate(a.config.InvoicesLimit); err != nil {
		return InvoiceError("params.invalid").WithDetail(err)
	}

	invoices, err := a.db.GetPublicInvoices(req.Context(), requestOptions)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, NewPagedInvoices(invoices, requestOptions.Limit))
	return nil
}

func (a *App) getInvoiceFromDb(ctx goContext.Context, id int) (*entity.Invoice, error) {
	invoice, err := a.db.GetInvoice(ctx, id)
	if err != nil {
		if _, ok := err.(*dbutil.NotFoundError); ok {
			return nil, handlerutil.NewNotFoundError("invoice.notFound")
		}
		return nil, err
	}
	return invoice, nil
}

func (a *App) getInvoiceFromStorage(ctx goContext.Context, id int) ([]byte, error) {
	invoice, err := a.storage.GetInvoice(ctx, id)
	if err != nil {
		if _, ok := err.(*storage.NotFoundError); ok {
			return nil, handlerutil.NewNotFoundError("invoice.notFound")
		}
		return nil, err
	}
	return invoice, nil
}

func (a *App) getInvoice(res http.ResponseWriter, req *http.Request) error {
	vars := mux.Vars(req)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return InvoiceError("param.id.invalid").WithDetail(err)
	}

	invoice, err := a.getInvoiceFromDb(req.Context(), id)
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
		return InvoiceError("params.id.invalid")
	}

	// DB is source of truth, so we have to check if invoice exists in DB
	_, err = a.getInvoiceFromDb(req.Context(), id)
	if err != nil {
		return err
	}

	invoice, err := a.getInvoiceFromStorage(req.Context(), id)
	if err != nil {
		return err
	}

	res.Header().Set("Content-Type", "application/xml")
	res.Header().Set("Content-Disposition", "attachment; filename=invoice-"+vars["id"]+".xml")
	res.WriteHeader(http.StatusOK)
	_, err = res.Write(invoice)
	return err
}

func (a *App) getInvoiceVisualization(res http.ResponseWriter, req *http.Request) error {
	vars := mux.Vars(req)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return InvoiceError("params.id.invalid")
	}

	// DB is source of truth, so we have to check if invoice exists in DB
	_, err = a.getInvoiceFromDb(req.Context(), id)
	if err != nil {
		return err
	}

	invoiceFile, err := a.getInvoiceFromStorage(req.Context(), id)
	if err != nil {
		return err
	}

	data, err := visualization.GenerateZip(invoiceFile)
	if err != nil {
		return err
	}

	res.Header().Set("Content-Type", "application/zip")
	res.Header().Set("Content-Disposition", "attachment; filename=invoice-"+vars["id"]+".zip")
	res.WriteHeader(http.StatusOK)
	_, err = io.Copy(res, data)
	return err
}

func NewUserInvoicesOptions(userId int, params url.Values, maxLimit int) (*db.UserInvoicesOptions, error) {
	publicInvoicesOptions, err := NewPublicInvoicesOptions(params, maxLimit)
	if err != nil {
		return nil, err
	}
	return &db.UserInvoicesOptions{
		userId,
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
		return InvoiceError("params.invalid").WithDetail(err)
	}

	if err := requestOptions.Validate(a.config.InvoicesLimit); err != nil {
		return InvoiceError("params.invalid").WithDetail(err)
	}

	invoices, err := a.db.GetUserInvoices(req.Context(), requestOptions)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, NewPagedInvoices(invoices, requestOptions.Limit))
	return nil
}
