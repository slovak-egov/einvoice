package apiserver

import (
	goContext "context"
	"io/ioutil"
	"net/http"

	"github.com/slovak-egov/einvoice/internal/apiserver/invoiceValidator"
	"github.com/slovak-egov/einvoice/internal/apiserver/metadataExtractor"
	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

type CreateInvoiceRequestBody struct {
	invoice         []byte
	format          string
	language        string
	test            bool
	foreignSupplier bool
}

func (b *CreateInvoiceRequestBody) parse(req *http.Request) error {
	b.format = req.PostFormValue("format")
	if b.format == "" {
		return InvoiceError("format.missing")
	} else if b.format != entity.UblFormat && b.format != entity.D16bFormat {
		return InvoiceError("format.unknown")
	}

	b.language = req.PostFormValue("lang")
	if b.language == "" {
		b.language = entity.EnglishLanguage
	} else if b.language != entity.EnglishLanguage && b.language != entity.SlovakLanguage {
		return InvoiceError("language.unknown")
	}

	var err error
	b.test, err = getOptionalBool(req.PostFormValue("test"), false)
	if err != nil {
		return InvoiceError("test.invalid").WithDetail(err)
	}
	b.foreignSupplier, err = getOptionalBool(req.PostFormValue("foreignSupplier"), false)
	if err != nil {
		return InvoiceError("foreignSupplier.invalid").WithDetail(err)
	}
	b.invoice, err = parseInvoice(req)
	if err != nil {
		return InvoiceError("file.parsingError").WithDetail(err)
	}
	return nil
}

func parseInvoice(req *http.Request) ([]byte, error) {
	file, _, err := req.FormFile("invoice")
	defer file.Close()
	if err != nil {
		context.GetLogger(req.Context()).
			WithField("error", err.Error()).
			Debug("app.parseInvoice.getFormFile.failed")

		return nil, err
	}

	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		context.GetLogger(req.Context()).
			WithField("error", err.Error()).
			Debug("app.parseInvoice.failed")

		return nil, err
	}
	return bytes, nil
}

// Check if creator has permission to submit invoice
func validateInvoice(ctx goContext.Context, db *db.Connector, inv *entity.Invoice, foreignSupplier bool) error {
	if foreignSupplier {
		return db.IsValidSubstitute(ctx, inv.CreatedBy, inv.CustomerIco)
	} else {
		return db.IsValidSubstitute(ctx, inv.CreatedBy, inv.SupplierIco)
	}
}

func (a *App) createInvoice(res http.ResponseWriter, req *http.Request) error {
	requestBody := CreateInvoiceRequestBody{}
	err := requestBody.parse(req)
	if err != nil {
		return err
	}
	userId := context.GetUserId(req.Context())

	// Validate invoice format
	if err = a.xsdValidator.Validate(requestBody.invoice, requestBody.format); err != nil {
		return InvoiceError("xsd.validation.failed").WithDetail(err)
	}
	// In future possibly adjust validation accoding to foreignSupplier flag
	if err = a.invoiceValidator.Validate(req.Context(), requestBody.invoice, requestBody.format, requestBody.language); err != nil {
		if _, ok := err.(*invoiceValidator.ValidationError); ok {
			return handlerutil.NewBadRequestError("invoice.validation.failed").WithDetail(err)
		} else if _, ok := err.(*invoiceValidator.RequestError); ok {
			return handlerutil.NewFailedDependencyError("invoice.validation.request.failed")
		} else {
			return err
		}
	}
	metadata, err := metadataExtractor.ParseInvoice(requestBody.invoice, requestBody.format)
	if err != nil {
		return InvoiceError("validation.failed").WithDetail(err)
	}

	// Add creator Id, test flag, isPublic flag
	metadata.CreatedBy = userId
	metadata.Test = requestBody.test
	// TODO: add public ICO list
	metadata.IsPublic = true

	err = validateInvoice(req.Context(), a.db, metadata, requestBody.foreignSupplier)
	if _, ok := err.(*dbutil.NotFoundError); ok {
		return handlerutil.NewForbiddenError("invoice.create.permission.missing")
	} else if err != nil {
		return err
	}

	// Limit number of created test invoices
	if requestBody.test {
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
		if e := a.storage.SaveInvoice(ctx, metadata.Id, requestBody.invoice); e != nil {
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
