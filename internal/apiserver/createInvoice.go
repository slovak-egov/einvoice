package apiserver

import (
	goContext "context"
	"io"
	"net/http"
	"time"

	"github.com/slovak-egov/einvoice/internal/apiserver/metadataExtractor"
	"github.com/slovak-egov/einvoice/internal/apiserver/rulesValidator"
	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
	"github.com/slovak-egov/einvoice/pkg/ulid"
)

func (a *App) parseAndValidateInvoice(res http.ResponseWriter, req *http.Request) ([]byte, string, error) {
	req.Body = http.MaxBytesReader(res, req.Body, a.config.MaxInvoiceSize)
	invoice, err := io.ReadAll(req.Body)
	if err != nil {
		context.GetLogger(req.Context()).
			WithField("error", err.Error()).
			Debug("app.parseInvoice.failed")

		return nil, "", InvoiceError("parsingError").WithDetail(err)
	}

	format, documentType, err := a.xsdValidator.GetFormatAndType(invoice)
	if err != nil {
		return nil, "", InvoiceError("format.invalid").WithDetail(err)
	}

	language := req.Header.Get("Accept-Language")

	// Validate invoice format
	if err = a.xsdValidator.Validate(invoice, format, documentType); err != nil {
		return nil, "", InvoiceError("xsdValidation.failed").WithDetail(err)
	}

	if err = a.rulesValidator.Validate(req.Context(), invoice, format, language); err != nil {
		if _, ok := err.(*rulesValidator.ValidationError); ok {
			return nil, "", InvoiceError("rulesValidation.failed").WithDetail(err)
		} else if _, ok := err.(*rulesValidator.RequestError); ok {
			return nil, "", handlerutil.NewFailedDependencyError("invoice.validation.request.failed")
		} else {
			return nil, "", err
		}
	}

	return invoice, format, nil
}

// Check if creator has permission to submit invoice
func validateInvoice(ctx goContext.Context, db *db.Connector, inv *entity.Invoice, partiesType string) error {
	if partiesType == entity.ForeignSupplierParty {
		return db.IsValidSubstitute(ctx, inv.CreatedBy, inv.CustomerIco)
	} else {
		return db.IsValidSubstitute(ctx, inv.CreatedBy, inv.SupplierIco)
	}
}

func (a *App) createInvoice(test bool) func(res http.ResponseWriter, req *http.Request) error {
	return func(res http.ResponseWriter, req *http.Request) error {
		invoice, format, err := a.parseAndValidateInvoice(res, req)
		if err != nil {
			return err
		}

		metadata, err := metadataExtractor.ParseInvoice(invoice, format)
		if err != nil {
			return InvoiceError("validation.failed").WithDetail(err)
		}

		userId := context.GetUserId(req.Context())

		// Add id, creator Id, test flag
		metadata.Id = ulid.New(time.Now().UTC()).String()
		metadata.CalculateCreatedAt()
		metadata.CreatedBy = userId
		metadata.Test = test

		partiesType := metadata.GetInvoicePartiesType()

		err = validateInvoice(req.Context(), a.db, metadata, partiesType)
		if _, ok := err.(*dbutil.NotFoundError); ok {
			return handlerutil.NewForbiddenError("invoice.create.permission.missing")
		} else if err != nil {
			return err
		}

		// Limit number of created test invoices
		if test {
			counter, err := a.cache.IncrementTestInvoiceCounter(req.Context(), userId)
			if err != nil {
				return err
			}
			if counter > a.config.Cache.TestInvoiceRateLimiterThreshold {
				return handlerutil.NewTooManyRequestsError("invoice.test.rateLimit")
			}
		}

		// DB is source of truth, so we have to save invoice to DB at the end
		if err = a.storage.SaveInvoice(req.Context(), metadata.Id, invoice); err != nil {
			return err
		}
		if err = a.db.CreateInvoice(req.Context(), metadata); err != nil {
			return err
		}

		// Notifications to invoice parties are sent asynchronously by notification-worker

		handlerutil.RespondWithJSON(res, http.StatusCreated, metadata)
		return nil
	}
}
