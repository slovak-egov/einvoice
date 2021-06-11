package xsdValidator_test

import (
	"os"
	"testing"

	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/xsd"
	log "github.com/sirupsen/logrus"
	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
)

func TestValidation(t *testing.T) {
	var flagtests = []struct {
		format          string
		documentType    string
		testInvoicePath string
	}{
		{entity.UblFormat, entity.InvoiceDocumentType, "../../data/examples/ubl2.1/invoice.xml"},
		{entity.UblFormat, entity.InvoiceDocumentType, "../../data/examples/ubl2.1-simple/invoice.xml"},
		{entity.UblFormat, entity.CreditNoteDocumentType, "../../data/examples/ubl2.1/creditNote.xml"},
		{entity.UblFormat, entity.CreditNoteDocumentType, "../../data/examples/ubl2.1-simple/creditNote.xml"},
		{entity.D16bFormat, entity.InvoiceDocumentType, "../../data/examples/d16b/invoice.xml"},
	}
	for _, tt := range flagtests {
		t.Run(tt.format, func(t *testing.T) {
			bytes, err := os.ReadFile(tt.testInvoicePath)
			if err != nil {
				t.Fatal(err)
			}

			assert.Nil(t, validator.Validate(bytes, tt.format, tt.documentType))
		})
	}
}

func TestGetFormatAndType(t *testing.T) {
	var flagtests = []struct {
		testInvoicePath string
		format          string
		documentType    string
	}{
		{"../../data/examples/ubl2.1/invoice.xml", entity.UblFormat, entity.InvoiceDocumentType},
		{"../../data/examples/ubl2.1/invoice-rules-violation.xml", entity.UblFormat, entity.InvoiceDocumentType},
		{"../../data/examples/ubl2.1/invoice-xsd-violation.xml", entity.UblFormat, entity.InvoiceDocumentType},
		{"../../data/examples/ubl2.1-simple/invoice.xml", entity.UblFormat, entity.InvoiceDocumentType},
		{"../../data/examples/ubl2.1/creditNote.xml", entity.UblFormat, entity.CreditNoteDocumentType},
		{"../../data/examples/ubl2.1-simple/creditNote.xml", entity.UblFormat, entity.CreditNoteDocumentType},
		{"../../data/examples/d16b/invoice.xml", entity.D16bFormat, entity.InvoiceDocumentType},
		{"../../data/examples/d16b/invoice-rules-violation.xml", entity.D16bFormat, entity.InvoiceDocumentType},
	}
	for _, tt := range flagtests {
		t.Run(tt.format+" "+tt.documentType, func(t *testing.T) {
			bytes, err := os.ReadFile(tt.testInvoicePath)
			if err != nil {
				t.Fatal(err)
			}

			format, documentType, err := validator.GetFormatAndType(bytes)
			assert.Nil(t, err)
			assert.Equal(t, tt.format, format)
			assert.Equal(t, tt.documentType, documentType)
		})
	}
}

func TestValidationSimpleXsd(t *testing.T) {
	ubl21MainFile := "../../data/schemas/ubl2.1-simple/xsd/maindoc/UBL-Invoice-2.1.xsd"
	ubl21Schema, err := xsd.ParseFromFile(ubl21MainFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.ubl2.1.failed")
	}

	ubl21CreditNoteMainFile := "../../data/schemas/ubl2.1-simple/xsd/maindoc/UBL-CreditNote-2.1.xsd"
	ubl21CreditNoteSchema, err := xsd.ParseFromFile(ubl21CreditNoteMainFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.ubl2.1.failed")
	}

	var flagtests = []struct {
		name        string
		schema      *xsd.Schema
		invoicePath string
	}{
		{"invoice", ubl21Schema, "../../data/examples/ubl2.1-simple/invoice.xml"},
		{"creditNote", ubl21CreditNoteSchema, "../../data/examples/ubl2.1-simple/creditNote.xml"},
	}
	for _, tt := range flagtests {
		t.Run(tt.name, func(t *testing.T) {
			bytes, err := os.ReadFile(tt.invoicePath)
			if err != nil {
				t.Fatal(err)
			}

			invoiceXml, err := libxml2.Parse(bytes)
			if err != nil {
				t.Error(err)
			}

			if err = tt.schema.Validate(invoiceXml); err != nil {
				t.Error(err)
			}
		})
	}
}
