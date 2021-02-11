package apiserver

import (
	goContext "context"
	"io/ioutil"
	"net/http"

	"github.com/slovak-egov/einvoice/internal/apiserver/invoiceValidator"
	"github.com/slovak-egov/einvoice/internal/apiserver/xml/d16b"
	"github.com/slovak-egov/einvoice/internal/apiserver/xml/ubl2.1"
	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

var formatToParsers = map[string]struct {
	GetXsdValidator     func(*App) func([]byte) error
	GetInvoiceValidator func(*App) func(goContext.Context, []byte) error
	MetadataExtractor   func([]byte) (*entity.Invoice, error)
}{
	entity.UblFormat: {
		func(a *App) func([]byte) error { return a.xsdValidator.ValidateUBL21 },
		func(a *App) func(goContext.Context, []byte) error { return a.invoiceValidator.ValidateUBL21 },
		ubl21.Create,
	},
	entity.D16bFormat: {
		func(a *App) func([]byte) error { return a.xsdValidator.ValidateD16B },
		func(a *App) func(goContext.Context, []byte) error { return a.invoiceValidator.ValidateD16B },
		d16b.Create,
	},
}

type CreateInvoiceRequestBody struct {
	invoice []byte
	test    bool
	format  string
}

func (b *CreateInvoiceRequestBody) parse(req *http.Request) error {
	b.format = req.PostFormValue("format")
	if b.format == "" {
		return InvoiceError("format.missing")
	} else if b.format != entity.UblFormat && b.format != entity.D16bFormat {
		return InvoiceError("format.unknown")
	}

	var err error
	b.test, err = getOptionalBool(req.PostFormValue("test"), false)
	if err != nil {
		return InvoiceError("test.invalid").WithDetail(err)
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

// Check if creator has permission to submit invoice as supplier IČO
func validateInvoice(ctx goContext.Context, db *db.Connector, inv *entity.Invoice) error {
	return db.IsValidSubstitute(ctx, inv.CreatedBy, inv.SupplierIco)
}

func (a *App) createInvoice(res http.ResponseWriter, req *http.Request) error {
	requestBody := CreateInvoiceRequestBody{}
	err := requestBody.parse(req)
	if err != nil {
		return err
	}
	userId := context.GetUserId(req.Context())

	parsers := formatToParsers[requestBody.format]

	// Validate invoice format
	var metadata *entity.Invoice

	if err = parsers.GetXsdValidator(a)(requestBody.invoice); err != nil {
		return InvoiceError("xsd.validation.failed").WithDetail(err)
	}
	if err = parsers.GetInvoiceValidator(a)(req.Context(), requestBody.invoice); err != nil {
		if _, ok := err.(*invoiceValidator.ValidationError); ok {
			return handlerutil.NewBadRequestError("invoice.validation.failed").WithDetail(err)
		} else if _, ok := err.(*invoiceValidator.RequestError); ok {
			return handlerutil.NewFailedDependencyError("invoice.validation.request.failed")
		} else {
			return err
		}
	}
	metadata, err = parsers.MetadataExtractor(requestBody.invoice)
	if err != nil {
		return InvoiceError("validation.failed").WithDetail(err)
	}

	// Add creator Id, test flag, isPublic flag
	metadata.CreatedBy = userId
	metadata.Test = requestBody.test
	// TODO: add public ICO list
	metadata.IsPublic = true

	err = validateInvoice(req.Context(), a.db, metadata)
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
