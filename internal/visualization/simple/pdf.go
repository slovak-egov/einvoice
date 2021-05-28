package simple

import (
	"encoding/xml"
	"fmt"

	"github.com/jung-kurt/gofpdf"

	"github.com/slovak-egov/einvoice/internal/apiserver/metadataExtractor"
)

const (
	fontSize   = 5
	lineHeight = 7
	font       = "dejavu"
)

var pageHeight, pageWidth float64

func GeneratePdf(fontsDir string, rawInvoice []byte) (*gofpdf.Fpdf, error) {
	invoice := &metadataExtractor.UblInvoice{}
	err := xml.Unmarshal(rawInvoice, &invoice)
	if err != nil {
		return nil, err
	}

	pdf := gofpdf.New("P", "mm", "A4", fontsDir)

	pdf.AddUTF8Font(font, "", "DejaVuSansCondensed.ttf")
	pdf.AddUTF8Font(font, "B", "DejaVuSansCondensed-Bold.ttf")
	pdf.AddUTF8Font(font, "I", "DejaVuSansCondensed-Oblique.ttf")
	pdf.AddUTF8Font(font, "BI", "DejaVuSansCondensed-BoldOblique.ttf")
	pdf.SetFont(font, "", fontSize)

	pdf.AddPage()
	left := pdf.GetX()
	pageWidth, pageHeight = pdf.GetPageSize()

	// Header
	pdf.SetFontStyle("B")
	pdf.SetFontUnitSize(2 * fontSize)
	pdf.SetY(20)
	pdf.SetX(left)
	pdf.Write(2*lineHeight, "Invoice "+invoice.ID)

	// Supplier
	writeParty(pdf, left, 0.3*pageHeight, "Supplier", &invoice.AccountingSupplierParty.Party)

	// Customer
	writeParty(pdf, left+0.5*pageWidth, 0.3*pageHeight, "Customer", &invoice.AccountingCustomerParty.Party)

	// Issued date
	pdf.SetFontStyle("")
	pdf.SetFontUnitSize(fontSize)
	pdf.SetXY(left, 0.45*pageHeight)
	pdf.Write(2*lineHeight, "Issue date: "+invoice.IssueDate)

	// Cost
	writeAmount(pdf, left, 0.55*pageHeight, invoice)

	return pdf, nil
}

func writeParty(pdf *gofpdf.Fpdf, x, y float64, name string, party *metadataExtractor.UblParty) {
	pdf.SetFontStyle("B")
	pdf.SetFontUnitSize(fontSize)
	pdf.SetXY(x, y)
	pdf.Write(2*lineHeight, name+":")
	pdf.SetFontStyle("")
	pdf.SetXY(x, y+2*lineHeight)
	pdf.Write(lineHeight, party.PartyLegalEntity.RegistrationName)
	pdf.SetXY(x, y+3*lineHeight)
	pdf.Write(lineHeight, "IČO: "+party.PartyLegalEntity.CompanyID)
}

func writeAmount(pdf *gofpdf.Fpdf, x, y float64, invoice *metadataExtractor.UblInvoice) {
	pdf.SetFontStyle("")
	pdf.SetFontUnitSize(fontSize)
	pdf.SetXY(x, y)
	pdf.Write(2*lineHeight, fmt.Sprintf("Total: %.2f %s", invoice.LegalMonetaryTotal.TaxInclusiveAmount.Value, invoice.LegalMonetaryTotal.TaxInclusiveAmount.CurrencyID))
}
