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

func (a *App) createInvoice(res http.ResponseWriter, req *http.Request) {
	// TODO: return 413 if request is too large
	err := req.ParseMultipartForm(10 << 20)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, "Invalid payload")
		return
	}

	format := req.PostFormValue("format")
	invoice, err := parseInvoice(req)
	if err != nil {
		handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
		return
	}

	// Validate invoice format
	var metadata *entity.Invoice

	switch format {
	case entity.UblFormat:
		if err = a.validator.ValidateUBL21(invoice); err != nil {
			handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
			return
		}
		metadata, err = ubl21.Create(invoice)
		if err != nil {
			handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
			return
		}
	case entity.D16bFormat:
		if err = a.validator.ValidateD16B(invoice); err != nil {
			handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
			return
		}
		metadata, err = d16b.Create(invoice)
		if err != nil {
			handlerutil.RespondWithError(res, http.StatusBadRequest, err.Error())
			return
		}
	default:
		handlerutil.RespondWithError(res, http.StatusBadRequest, "Invalid invoice format")
		return
	}

	// Add creator Id
	metadata.CreatedBy = context.GetUserId(req.Context())

	if err = validateInvoice(req.Context(), a.db, metadata); err != nil {
		handlerutil.RespondWithError(res, http.StatusForbidden, err.Error())
		return
	}

	// TODO: make DB+storage saving atomic
	if err := a.db.CreateInvoice(req.Context(), metadata); err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
	}
	if err := a.storage.SaveInvoice(req.Context(), metadata.Id, invoice); err != nil {
		handlerutil.RespondWithError(res, http.StatusInternalServerError, "Something went wrong")
		return
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
}
