package simple

import (
	"bytes"
	"encoding/xml"
	"html/template"
	"io"

	"github.com/SebastiaanKlippert/go-wkhtmltopdf"

	"github.com/slovak-egov/einvoice/internal/apiserver/metadataExtractor"
	"github.com/slovak-egov/einvoice/internal/entity"
)

func GeneratePdf(invoiceType string, tmpl *template.Template, rawInvoice []byte) (io.Reader, error) {
	invoice := &metadataExtractor.UblInvoiceFull{}
	err := xml.Unmarshal(rawInvoice, &invoice)
	if err != nil {
		return nil, err
	}

	tmplMetadata := TemplateMeta{
		IsInvoice: invoiceType == entity.InvoiceDocumentType,
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
