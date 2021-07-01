package simple

import (
	"bytes"
	"encoding/base64"
	"encoding/xml"
	"html/template"
	"io"

	"github.com/SebastiaanKlippert/go-wkhtmltopdf"
	"github.com/skip2/go-qrcode"

	"github.com/slovak-egov/einvoice/internal/apiserver/metadataExtractor"
	"github.com/slovak-egov/einvoice/internal/entity"
)

func generateQrCode(id string) (string, error) {
	code, err := qrcode.New(id, qrcode.Highest)
	if err != nil {
		return "", err
	}

	code.DisableBorder = true

	png, err := code.PNG(256)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(png), nil
}

func GeneratePdf(invoiceType string, tmpl *template.Template, rawInvoice []byte, id string) (io.Reader, error) {
	invoice := &metadataExtractor.UblInvoiceFull{}
	err := xml.Unmarshal(rawInvoice, &invoice)
	if err != nil {
		return nil, err
	}

	qrBase64 := ""
	if id != "" {
		qrBase64, err = generateQrCode(id)
		if err != nil {
			return nil, err
		}
	}

	tmplMetadata := TemplateMeta{
		IsInvoice: invoiceType == entity.InvoiceDocumentType,
		TokenQR:   qrBase64,
		Xml:       invoice,
	}

	buffer := bytes.NewBuffer(nil)

	err = tmpl.Execute(buffer, tmplMetadata)
	if err != nil {
		println(err.Error())
		return nil, err
	}

	pdfg, err := wkhtmltopdf.NewPDFGenerator()
	if err != nil {
		println(err.Error())
		return nil, err
	}

	pdfg.Dpi.Set(300)
	pdfg.Orientation.Set(wkhtmltopdf.OrientationPortrait)
	pdfg.Grayscale.Set(true)

	page := wkhtmltopdf.NewPageReader(buffer)

	// Set options for this page
	page.EnableLocalFileAccess.Set(true)

	// Add to document
	pdfg.AddPage(page)

	err = pdfg.Create()
	if err != nil {
		println(err.Error())
		return nil, err
	}

	return pdfg.Buffer(), nil
}
