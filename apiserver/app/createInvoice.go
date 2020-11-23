package app

import (
	"io/ioutil"
	"net/http"
	"strconv"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/apiserver/xml/d16b"
	"github.com/slovak-egov/einvoice/apiserver/xml/ubl21"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func parseInvoice(r *http.Request) ([]byte, error) {
	file, _, err := r.FormFile("invoice")
	defer file.Close()
	if err != nil {
		log.WithField("error", err.Error()).Debug("app.createInvoice.getFormFile.failed")
		return nil, err
	}

	bytes, err := ioutil.ReadAll(file)
	if err != nil {
		log.WithField("error", err.Error()).Debug("app.createInvoice.parseInvoice.failed")
		return nil, err
	}
	return bytes, nil
}

// Check if creator has permission to submit invoice as supplier IČO
func validateInvoice(db *db.Connector, inv *entity.Invoice) error {
	return db.IsValidSubstitute(inv.CreatedBy, inv.SupplierICO)
}

func (a *App) createInvoice(w http.ResponseWriter, r *http.Request) {
	// TODO: return 413 if request is too large
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		handlerutil.RespondWithError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	format := r.PostFormValue("format")
	invoice, err := parseInvoice(r)
	if err != nil {
		handlerutil.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Validate invoice format
	var metadata *entity.Invoice

	switch format {
	case entity.UblFormat:
		if err = a.validator.ValidateUBL21(invoice); err != nil {
			handlerutil.RespondWithError(w, http.StatusBadRequest, err.Error())
			return
		}
		metadata, err = ubl21.Create(invoice)
		if err != nil {
			handlerutil.RespondWithError(w, http.StatusBadRequest, err.Error())
			return
		}
	case entity.D16bFormat:
		if err = a.validator.ValidateD16B(invoice); err != nil {
			handlerutil.RespondWithError(w, http.StatusBadRequest, err.Error())
			return
		}
		metadata, err = d16b.Create(invoice)
		if err != nil {
			handlerutil.RespondWithError(w, http.StatusBadRequest, err.Error())
			return
		}
	default:
		handlerutil.RespondWithError(w, http.StatusBadRequest, "Invalid invoice format")
		return
	}

	userId, err := strconv.Atoi(r.Header.Get("User-Id"))
	if err != nil {
		log.WithField("error", err.Error()).Panic("app.createInvoice.userId.invalid")
	}

	// Add creator Id
	metadata.CreatedBy = userId

	if err = validateInvoice(a.db, metadata); err != nil {
		handlerutil.RespondWithError(w, http.StatusForbidden, err.Error())
		return
	}

	// TODO: make DB+storage saving atomic
	if err := a.db.CreateInvoice(metadata); err != nil {
		handlerutil.RespondWithError(w, http.StatusInternalServerError, "Something went wrong")
		return
	}
	if err := a.storage.SaveInvoice(metadata.Id, invoice); err != nil {
		handlerutil.RespondWithError(w, http.StatusInternalServerError, "Something went wrong")
		return
	}

	// Send mail notifications
	if a.mail != nil {
		// Can run in daemon, ideally separate worker scraping DB
		receivers, err := a.db.GetUserEmails([]string{metadata.SupplierICO, metadata.CustomerICO})
		if err != nil && len(receivers) > 0 {
			a.mail.SendInvoice(receivers, invoice)
		}
	}

	handlerutil.RespondWithJSON(w, http.StatusCreated, metadata)
}
