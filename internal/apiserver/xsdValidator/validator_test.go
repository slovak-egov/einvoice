package xsdValidator_test

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
)

func TestValidation(t *testing.T) {
	var flagtests = []struct {
		format          string
		documentType    string
		testInvoicePath string
	}{
		{entity.UblFormat, entity.InvoiceDocumentType, "../../../data/examples/ubl2.1/invoice.xml"},
		{entity.UblFormat, entity.CreditNoteDocumentType, "../../../data/examples/ubl2.1/creditNote.xml"},
		{entity.D16bFormat, entity.InvoiceDocumentType, "../../../data/examples/d16b/invoice.xml"},
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
		{"../../../data/examples/ubl2.1/invoice.xml", entity.UblFormat, entity.InvoiceDocumentType},
		{"../../../data/examples/ubl2.1/invoice-rules-violation.xml", entity.UblFormat, entity.InvoiceDocumentType},
		{"../../../data/examples/ubl2.1/invoice-xsd-violation.xml", entity.UblFormat, entity.InvoiceDocumentType},
		{"../../../data/examples/ubl2.1/creditNote.xml", entity.UblFormat, entity.CreditNoteDocumentType},
		{"../../../data/examples/d16b/invoice.xml", entity.D16bFormat, entity.InvoiceDocumentType},
		{"../../../data/examples/d16b/invoice-rules-violation.xml", entity.D16bFormat, entity.InvoiceDocumentType},
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
