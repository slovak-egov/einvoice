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
	invoice      []byte
	format       string
	language     string
	documentType string
}

func (b *VisualizationRequestBody) parse(req *http.Request) error {
	var err error
	b.format, err = getEnum(req.PostFormValue("format"), entity.InvoiceFormats, "")
	if err != nil {
		return InvoiceError("format." + err.Error())
	}

	b.language, err = getEnum(req.PostFormValue("lang"), entity.Languages, entity.EnglishLanguage)
	if err != nil {
		return InvoiceError("language.unknown")
	}

	b.invoice, err = parseInvoice(req)
	if err != nil {
		return InvoiceError("file.parsingError").WithDetail(err)
	}

	b.documentType, err = getEnum(req.PostFormValue("documentType"), entity.DocumentTypes, entity.InvoiceDocumentType)
	if err != nil {
		return InvoiceError("documentType." + err.Error())
	}

	return nil
}

func (a *App) createVisualization(res http.ResponseWriter, req *http.Request) error {
	requestBody := VisualizationRequestBody{}
	err := requestBody.parse(req)
	if err != nil {
		return err
	}

	if err = a.xsdValidator.Validate(requestBody.invoice, requestBody.format, requestBody.documentType); err != nil {
		return InvoiceError("xsd.validation.failed").WithDetail(err)
	}
	if err = a.invoiceValidator.Validate(req.Context(), requestBody.invoice, requestBody.format, requestBody.language); err != nil {
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
