package app

import (
	goContext "context"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/apiserver/storage"
	"github.com/slovak-egov/einvoice/apiserver/visualization"
	"github.com/slovak-egov/einvoice/pkg/context"
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
		order = db.DescOrder
	}
	return &db.PublicInvoicesOptions{
		params["format"],
		startId,
		limit,
		test,
		params.Get("ico"),
		order,
	}, nil
}

func (a *App) getPublicInvoices(res http.ResponseWriter, req *http.Request) error {
	requestOptions, err := NewPublicInvoicesOptions(req.URL.Query(), a.config.InvoicesLimit)
	if err != nil {
		return InvoiceError("params.invalid").WithCause(err)
	}

	if err := requestOptions.Validate(a.config.InvoicesLimit); err != nil {
		return InvoiceError("params.invalid").WithCause(err)
	}

	invoices, err := a.db.GetPublicInvoices(req.Context(), requestOptions)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, NewPagedInvoices(invoices, requestOptions.Limit))
	return nil
}

func (a *App) canUserViewInvoice(ctx goContext.Context, invoice *entity.Invoice) error {
	// Anyone can view invoice if it is public
	if invoice.IsPublic {
		return nil
	} else if context.GetUserId(ctx) == 0 {
		// Unauthenticated user does not have access to private invoices
		return UnauthorizedError
	}

	accessibleIcos, err := a.db.GetUserOrganizationIds(ctx, context.GetUserId(ctx))
	if err != nil {
		return err
	}

	for _, ico := range accessibleIcos {
		// User can view invoice if one of contract parties is accessible by him
		if ico == invoice.CustomerIco || ico == invoice.SupplierIco {
			return nil
		}
	}
	return handlerutil.NewForbiddenError("invoice.permission.missing")
}

func (a *App) getInvoice(res http.ResponseWriter, req *http.Request) error {
	vars := mux.Vars(req)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return InvoiceError("params.id.invalid")
	}

	invoice, err := a.db.GetInvoice(req.Context(), id)
	if err != nil {
		if _, ok := err.(*db.NotFoundError); ok {
			return handlerutil.NewNotFoundError("invoice.notFound")
		}
		return err
	}

	if err := a.canUserViewInvoice(req.Context(), invoice); err != nil {
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

	invoiceMeta, err := a.db.GetInvoice(req.Context(), id)
	if err != nil {
		if _, ok := err.(*db.NotFoundError); ok {
			return handlerutil.NewNotFoundError("invoice.notFound")
		}
		return err
	}

	if err := a.canUserViewInvoice(req.Context(), invoiceMeta); err != nil {
		return err
	}

	invoice, err := a.storage.GetInvoice(req.Context(), id)
	if err != nil {
		if _, ok := err.(*storage.NotFoundError); ok {
			return handlerutil.NewNotFoundError("invoice.notFound")
		}
		return err
	}

	res.Header().Set("Content-Type", "application/xml")
	res.Header().Set("Content-Disposition", "attachment; filename=invoice-"+vars["id"]+".xml")
	res.WriteHeader(http.StatusOK)
	res.Write(invoice)
	return nil
}

func (a *App) getInvoiceVisualization(res http.ResponseWriter, req *http.Request) error {
	vars := mux.Vars(req)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		return InvoiceError("params.id.invalid")
	}

	invoice, err := a.db.GetInvoice(req.Context(), id)
	if err != nil {
		if _, ok := err.(*db.NotFoundError); ok {
			return handlerutil.NewNotFoundError("invoice.notFound")
		}
		return err
	}

	if err := a.canUserViewInvoice(req.Context(), invoice); err != nil {
		return err
	}

	pdfFile := visualization.Generate(invoice)

	res.Header().Set("Content-Type", "application/pdf")
	res.Header().Set("Content-Disposition", "attachment; filename=invoice-"+vars["id"]+".pdf")
	res.WriteHeader(http.StatusOK)
	return pdfFile.Write(res)
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
		return InvoiceError("params.invalid").WithCause(err)
	}

	if err := requestOptions.Validate(a.config.InvoicesLimit); err != nil {
		return InvoiceError("params.invalid").WithCause(err)
	}

	invoices, err := a.db.GetUserInvoices(req.Context(), requestOptions)
	if err != nil {
		return err
	}

	handlerutil.RespondWithJSON(res, http.StatusOK, NewPagedInvoices(invoices, requestOptions.Limit))
	return nil
}
