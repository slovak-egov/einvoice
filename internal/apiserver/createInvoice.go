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

type CreateInvoiceRequestBody struct {
	invoice      []byte
	format       string
	language     string
	test         bool
	partiesType  string
	documentType string
}

func (b *CreateInvoiceRequestBody) parse(req *http.Request) error {
	var err error
	b.format, err = getEnum(req.PostFormValue("format"), entity.InvoiceFormats, "")
	if err != nil {
		return InvoiceError("format." + err.Error())
	}

	b.language, err = getEnum(req.PostFormValue("lang"), entity.Languages, entity.EnglishLanguage)
	if err != nil {
		return InvoiceError("language.unknown")
	}

	b.partiesType, err = getEnum(req.PostFormValue("partiesType"), entity.InvoicePartiesTypes, entity.SlovakInvoiceParties)
	if err != nil {
		return InvoiceError("partiesType.unknown")
	}

	b.test, err = getOptionalBool(req.PostFormValue("test"), false)
	if err != nil {
		return InvoiceError("test.invalid").WithDetail(err)
	}

	b.invoice, err = parseInvoice(req)
	if err != nil {
		return InvoiceError("file.parsingError").WithDetail(err)
	}

	b.documentType, err = getEnum(req.PostFormValue("documentType"), entity.DocumentTypes, entity.InvoiceDocumentType)
	if err != nil {
		return InvoiceError("documentType." + err.Error())
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

	bytes, err := io.ReadAll(file)
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

func (a *App) createInvoice(res http.ResponseWriter, req *http.Request) error {
	requestBody := CreateInvoiceRequestBody{}
	err := requestBody.parse(req)
	if err != nil {
		return err
	}
	userId := context.GetUserId(req.Context())

	// Validate invoice format
	if err = a.xsdValidator.Validate(requestBody.invoice, requestBody.format, requestBody.documentType); err != nil {
		return InvoiceError("xsd.validation.failed").WithDetail(err)
	}
	// In future possibly adjust validation according to partiesType
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

	// Add creator Id, test flag
	metadata.CreatedBy = userId
	metadata.Test = requestBody.test

	err = validateInvoice(req.Context(), a.db, metadata, requestBody.partiesType)
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
