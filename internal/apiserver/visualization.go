package apiserver

import (
	"io"
	"net/http"

	"github.com/slovak-egov/einvoice/internal/apiserver/invoiceValidator"
	"github.com/slovak-egov/einvoice/internal/apiserver/visualization"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
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

	parsers := formatToParsers[requestBody.format]

	if err = parsers.GetXsdValidator(a)(requestBody.invoice); err != nil {
		return InvoiceError("xsd.validation.failed").WithDetail(err)
	}
	if err = a.invoiceValidator.Validate(req.Context(), requestBody.invoice, requestBody.format); err != nil {
		if _, ok := err.(*invoiceValidator.ValidationError); ok {
			return handlerutil.NewBadRequestError("invoice.validation.failed").WithDetail(err)
		} else if _, ok := err.(*invoiceValidator.RequestError); ok {
			return handlerutil.NewFailedDependencyError("invoice.validation.request.failed")
		} else {
			return err
		}
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
