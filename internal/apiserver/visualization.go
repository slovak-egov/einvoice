package apiserver

import (
	"io"
	"net/http"

	"github.com/slovak-egov/einvoice/internal/apiserver/visualization"
	"github.com/slovak-egov/einvoice/internal/entity"
)

type VisualizationRequestBody struct {
	invoice  []byte
	format   string
}

func (b *VisualizationRequestBody) parse(req *http.Request) error {
	b.format = req.PostFormValue("format")
	if b.format == "" {
		return InvoiceError("format.missing")
	} else if b.format != entity.UblFormat && b.format != entity.D16bFormat {
		return InvoiceError("format.unknown")
	}

	var err error
	b.invoice, err = parseInvoice(req)
	if err != nil {
		return InvoiceError("file.parsingError").WithDetail(err)
	}

	return nil
}

func (a *App) createVisualization(res http.ResponseWriter, req *http.Request) error {
	requestBody := VisualizationRequestBody{}
	err := requestBody.parse(req)
	if err != nil {
		return err
	}

	if err = formatToParsers[requestBody.format].GetXsdValidator(a)(requestBody.invoice); err != nil {
		return InvoiceError("xsd.validation.failed").WithDetail(err)
	}

	data, err := visualization.GenerateZip(requestBody.invoice)
	if err != nil {
		return err
	}

	res.Header().Set("Content-Type", "application/zip")
	res.WriteHeader(http.StatusOK)
	_, err = io.Copy(res, data)
	return err
}
