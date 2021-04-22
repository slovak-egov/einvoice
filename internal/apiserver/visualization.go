package apiserver

import (
	"io"
	"net/http"
)

func (a *App) createVisualization(res http.ResponseWriter, req *http.Request) error {
	invoice, _, err := a.parseAndValidateInvoice(res, req)
	if err != nil {
		return err
	}

	data, err := a.visualizer.GenerateZip(invoice)
	if err != nil {
		return err
	}

	res.Header().Set("Content-Type", "application/zip")
	res.WriteHeader(http.StatusOK)
	_, err = io.Copy(res, data)
	return err
}
