package app

import (
	goContext "context"
	"errors"
	"io/ioutil"
	"net/http"

	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/apiserver/xml/d16b"
	"github.com/slovak-egov/einvoice/apiserver/xml/ubl21"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

var formatToParsers = map[string]struct {
	GetValidator      func(*App) func([]byte) error
	MetadataExtractor func([]byte) (*entity.Invoice, error)
}{
	entity.UblFormat: {
		func(a *App) func([]byte) error { return a.validator.ValidateUBL21 },
		ubl21.Create,
	},
	entity.D16bFormat: {
		func(a *App) func([]byte) error { return a.validator.ValidateD16B },
		d16b.Create,
	},
}

func parseRequestBody(req *http.Request) (invoice []byte, format string, test bool, err error) {
	// TODO: return 413 if request is too large
	err = req.ParseMultipartForm(10 << 20)
	if err != nil {
		err = InvoiceError("payload.invalid").WithCause(err)
		return
	}

	invoice, err = parseInvoice(req)
	if err != nil {
		err = InvoiceError("file.parsingError").WithCause(err)
		return
	}
	test, err = getOptionalBool(req.PostFormValue("test"), false)
	if err != nil {
		err = InvoiceError("test.invalid").WithCause(err)
		return
	}

	format = req.PostFormValue("format")
	if format == "" {
		err = InvoiceError("format.missing")
		return
	}
	return
}

func parseInvoice(req *http.Request) ([]byte, error) {
	file, _, err := req.FormFile("invoice")
	defer file.Close()
	if err != nil {
		context.GetLogger(req.Context()).
			WithField("error", err.Error()).
			Debug("app.createInvoice.getFormFile.failed")

		return nil, err
	}

	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		context.GetLogger(req.Context()).
			WithField("error", err.Error()).
			Debug("app.createInvoice.parseInvoice.failed")

		return nil, err
	}
	return bytes, nil
}

// Check if creator has permission to submit invoice as supplier IČO
func validateInvoice(ctx goContext.Context, db *db.Connector, inv *entity.Invoice) error {
	return db.IsValidSubstitute(ctx, inv.CreatedBy, inv.SupplierIco)
}

func (a *App) createInvoice(res http.ResponseWriter, req *http.Request) error {
	invoice, format, test, err := parseRequestBody(req)
	if err != nil {
		return err
	}
	userId := context.GetUserId(req.Context())

	if test {
		counter, err := a.cache.IncrementTestInvoiceCounter(req.Context(), userId)
		if err != nil {
			return err
		}
		if counter > a.config.Cache.TestInvoiceRateLimiterThreshold {
			return &handlerutil.HttpError{http.StatusTooManyRequests, errors.New("e")} // todo error
		}
	}

	parsers, ok := formatToParsers[format]
	if !ok {
		return InvoiceError("format.unknown")
	}

	// Validate invoice format
	var metadata *entity.Invoice

	if err = parsers.GetValidator(a)(invoice); err != nil {
		return InvoiceError("xsd.validation.failed").WithCause(err)
	}
	metadata, err = parsers.MetadataExtractor(invoice)
	if err != nil {
		return InvoiceError("validation.failed").WithCause(err)
	}

	// Add creator Id, test flag, isPublic flag
	metadata.CreatedBy = userId
	metadata.Test = test
	// TODO: add public ICO list
	metadata.IsPublic = true

	err = validateInvoice(req.Context(), a.db, metadata)
	if _, ok := err.(*db.NoSubstituteError); ok {
		return handlerutil.NewForbiddenError("invoice.create.permission.missing")
	} else if err != nil {
		return err
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

	// Send mail notifications
	if a.mail != nil {
		// Can run in daemon, ideally separate worker scraping DB
		receivers, err := a.db.GetUserEmails(req.Context(), []string{metadata.SupplierIco, metadata.CustomerIco})
		if err != nil && len(receivers) > 0 {
			a.mail.SendInvoice(req.Context(), receivers, invoice)
		}
	}

	handlerutil.RespondWithJSON(res, http.StatusCreated, metadata)
	return nil
}
