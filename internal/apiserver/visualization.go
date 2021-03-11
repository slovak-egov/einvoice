package apiserver

import (
	"io"
	"net/http"

	"github.com/slovak-egov/einvoice/internal/apiserver/invoiceValidator"
	"github.com/slovak-egov/einvoice/internal/apiserver/visualization"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func (a *App) createVisualization(res http.ResponseWriter, req *http.Request) error {
	invoice, err := parseInvoice(req)
	if err != nil {
		return InvoiceError("invoice.parsingError").WithDetail(err)
	}

	format, documentType, err := a.xsdValidator.GetFormatAndType(invoice)
	if err != nil {
		return InvoiceError("invoice." + err.Error())
	}

	if err = a.xsdValidator.Validate(invoice, format, documentType); err != nil {
		return InvoiceError("xsd.validation.failed").WithDetail(err)
	}
	if err = a.invoiceValidator.Validate(req.Context(), invoice, format); err != nil {
		if _, ok := err.(*invoiceValidator.ValidationError); ok {
			return handlerutil.NewBadRequestError("invoice.validation.failed").WithDetail(err)
		} else if _, ok := err.(*invoiceValidator.RequestError); ok {
			return handlerutil.NewFailedDependencyError("invoice.validation.request.failed")
		} else {
			return err
		}
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
