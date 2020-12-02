package app

import (
	goContext "context"
	"io/ioutil"
	"net/http"

	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/apiserver/xml/d16b"
	"github.com/slovak-egov/einvoice/apiserver/xml/ubl21"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

var formatToParsers = map[string]struct{
	GetValidator func(*App) func([]byte) error
	MetadataExtractor func([]byte) (*entity.Invoice, error)
}{
	entity.UblFormat: {
		func(a *App) func([]byte) error {return a.validator.ValidateUBL21},
		ubl21.Create,
	},
	entity.D16bFormat: {
		func(a *App) func([]byte) error {return a.validator.ValidateD16B},
		d16b.Create,
	},
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
	return db.IsValidSubstitute(ctx, inv.CreatedBy, inv.SupplierICO)
}

func (a *App) createInvoice(res http.ResponseWriter, req *http.Request) error {
	// TODO: return 413 if request is too large
	err := req.ParseMultipartForm(10 << 20)
	if err != nil {
		return handlerutil.NewBadRequestError("Invalid payload")
	}

	format := req.PostFormValue("format")
	invoice, err := parseInvoice(req)
	if err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}

	// Validate invoice format
	var metadata *entity.Invoice

	parsers, ok := formatToParsers[format]
	if !ok {
		return handlerutil.NewBadRequestError("Unknown invoice format")
	}

	if err = parsers.GetValidator(a)(invoice); err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}
	metadata, err = parsers.MetadataExtractor(invoice)
	if err != nil {
		return handlerutil.NewBadRequestError(err.Error())
	}

	// Add creator Id
	metadata.CreatedBy = context.GetUserId(req.Context())

	err = validateInvoice(req.Context(), a.db, metadata)
	if _, ok := err.(*db.NoSubstituteError); ok {
		return handlerutil.NewForbiddenError("You have no permission to create invoices with such IČO")
	} else if err != nil {
		return err
	}

	// TODO: make DB+storage saving atomic
	if err := a.db.CreateInvoice(req.Context(), metadata); err != nil {
		return err
	}
	if err := a.storage.SaveInvoice(req.Context(), metadata.Id, invoice); err != nil {
		return err
	}

	// Send mail notifications
	if a.mail != nil {
		// Can run in daemon, ideally separate worker scraping DB
		receivers, err := a.db.GetUserEmails(req.Context(), []string{metadata.SupplierICO, metadata.CustomerICO})
		if err != nil && len(receivers) > 0 {
			a.mail.SendInvoice(req.Context(), receivers, invoice)
		}
	}

	handlerutil.RespondWithJSON(res, http.StatusCreated, metadata)
	return nil
}
