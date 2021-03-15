package apiserver

import (
	"io"
	"net/http"

	"github.com/slovak-egov/einvoice/internal/apiserver/visualization"
)

func (a *App) createVisualization(res http.ResponseWriter, req *http.Request) error {
	invoice, _, err := a.parseAndValidateInvoice(res, req)
	if err != nil {
		return err
	}

	data, err := visualization.GenerateZip(invoice)
	if err != nil {
		return err
	}

	res.Header().Set("Content-Type", "application/zip")
	res.WriteHeader(http.StatusOK)
	_, err = io.Copy(res, data)
	return err
}
