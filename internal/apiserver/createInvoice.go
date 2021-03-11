package apiserver

import (
	goContext "context"
	"io"
	"net/http"

	"github.com/slovak-egov/einvoice/internal/apiserver/invoiceValidator"
	"github.com/slovak-egov/einvoice/internal/apiserver/metadataExtractor"
	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) parseAndValidateInvoice(req *http.Request) ([]byte, string, error) {
	invoice, err := parseInvoice(req)
	if err != nil {
		return nil, "", InvoiceError("invoice.parsingError").WithDetail(err)
	}

	format, documentType, err := a.xsdValidator.GetFormatAndType(invoice)
	if err != nil {
		return nil, "", InvoiceError("invoice.format.invalid").WithDetail(err)
	}

	language := req.Header.Get("Accept-Language")

	// Validate invoice format
	if err = a.xsdValidator.Validate(invoice, format, documentType); err != nil {
		return nil, "", InvoiceError("xsd.validation.failed").WithDetail(err)
	}
	// In future possibly adjust validation according to partiesType
	if err = a.invoiceValidator.Validate(req.Context(), invoice, format, language); err != nil {
		if _, ok := err.(*invoiceValidator.ValidationError); ok {
			return nil, "", handlerutil.NewBadRequestError("invoice.validation.failed").WithDetail(err)
		} else if _, ok := err.(*invoiceValidator.RequestError); ok {
			return nil, "", handlerutil.NewFailedDependencyError("invoice.validation.request.failed")
		} else {
			return nil, "", err
		}
	}

	return invoice, format, nil
}

func parseInvoice(req *http.Request) ([]byte, error) {
	bytes, err := io.ReadAll(req.Body)
	if err != nil {
		context.GetLogger(req.Context()).
			WithField("error", err.Error()).
			Debug("app.parseInvoice.failed")

		return nil, err
	}
	return bytes, nil
}

// Check if creator has permission to submit invoice
func validateInvoice(ctx goContext.Context, db *db.Connector, inv *entity.Invoice, partiesType string) error {
	if partiesType == entity.ForeignSupplierParty {
		return db.IsValidSubstitute(ctx, inv.CreatedBy, inv.CustomerIco)
	} else {
		return db.IsValidSubstitute(ctx, inv.CreatedBy, inv.SupplierIco)
	}
}

func (a *App) createInvoice(testInvoice bool) func(res http.ResponseWriter, req *http.Request) error {
	return func(res http.ResponseWriter, req *http.Request) error {
		invoice, format, err := a.parseAndValidateInvoice(req)
		if err != nil {
			return err
		}

		metadata, err := metadataExtractor.ParseInvoice(invoice, format)
		if err != nil {
			return InvoiceError("validation.failed").WithDetail(err)
		}

		userId := context.GetUserId(req.Context())

		// Add creator Id, test flag
		metadata.CreatedBy = userId
		metadata.Test = testInvoice

		partiesType := metadata.GetInvoicePartiesType()

		err = validateInvoice(req.Context(), a.db, metadata, partiesType)
		if _, ok := err.(*dbutil.NotFoundError); ok {
			return handlerutil.NewForbiddenError("invoice.create.permission.missing")
		} else if err != nil {
			return err
		}

		// Limit number of created test invoices
		if testInvoice {
			counter, err := a.cache.IncrementTestInvoiceCounter(req.Context(), userId)
			if err != nil {
				return err
			}
			if counter > a.config.Cache.TestInvoiceRateLimiterThreshold {
				return handlerutil.NewTooManyRequestsError("invoice.test.rateLimit")
			}
		}

		if err := a.db.RunInTransaction(req.Context(), func(ctx goContext.Context) error {
			if e := a.db.CreateInvoice(ctx, metadata); e != nil {
				return e
			}
			if e := a.storage.SaveInvoice(ctx, metadata.Id, invoice); e != nil {
				return e
			}
			return nil
		}); err != nil {
			return err
		}

		// Notifications to invoice parties are sent asynchronously by notification-worker

		handlerutil.RespondWithJSON(res, http.StatusCreated, metadata)
		return nil
	}
}
