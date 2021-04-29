package xsdValidator

import (
	"encoding/xml"
	"errors"

	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/types"
	"github.com/lestrrat-go/libxml2/xsd"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/entity"
)

type XsdValidator struct {
	ubl21Schema                 *xsd.Schema
	ubl21CreditNoteSchema       *xsd.Schema
	ubl21SimpleSchema           *xsd.Schema
	ubl21SimpleCreditNoteSchema *xsd.Schema
	d16bSchema                  *xsd.Schema
}

func New(xsdDirectory string) *XsdValidator {
	d16bXsdMainFile := xsdDirectory + "/d16b/xsd/data/standard/CrossIndustryInvoice_100pD16B.xsd"
	d16bSchema, err := xsd.ParseFromFile(d16bXsdMainFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.d16b.failed")
	}

	ubl21MainFile := xsdDirectory + "/ubl2.1/xsd/maindoc/UBL-Invoice-2.1.xsd"
	ubl21Schema, err := xsd.ParseFromFile(ubl21MainFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.ubl2.1.invoice.failed")
	}

	ubl21CreditNoteFile := xsdDirectory + "/ubl2.1/xsd/maindoc/UBL-CreditNote-2.1.xsd"
	ubl21CreditNoteSchema, err := xsd.ParseFromFile(ubl21CreditNoteFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.ubl2.1.creditNote.failed")
	}

	ubl21SimpleMainFile := xsdDirectory + "/ubl2.1-simple/xsd/maindoc/UBL-Invoice-2.1.xsd"
	ubl21SimpleSchema, err := xsd.ParseFromFile(ubl21SimpleMainFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.ubl2.1.simple.invoice.failed")
	}

	ubl21SimpleCreditNoteFile := xsdDirectory + "/ubl2.1-simple/xsd/maindoc/UBL-CreditNote-2.1.xsd"
	ubl21SimpleCreditNoteSchema, err := xsd.ParseFromFile(ubl21SimpleCreditNoteFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.ubl2.1.simple.creditNote.failed")
	}

	return &XsdValidator{
		ubl21Schema:                 ubl21Schema,
		ubl21CreditNoteSchema:       ubl21CreditNoteSchema,
		ubl21SimpleSchema:           ubl21SimpleSchema,
		ubl21SimpleCreditNoteSchema: ubl21SimpleCreditNoteSchema,
		d16bSchema:                  d16bSchema,
	}
}

func (v *XsdValidator) Validate(src []byte, format, documentType string) error {
	invoiceXml, err := libxml2.Parse(src)
	if err != nil {
		return err
	}

	var schema *xsd.Schema
	switch format {
	case entity.UblFormat:
		switch documentType {
		case entity.InvoiceDocumentType:
			schema = v.ubl21Schema
		case entity.CreditNoteDocumentType:
			schema = v.ubl21CreditNoteSchema
		}
	case entity.D16bFormat:
		schema = v.d16bSchema
	}

	if err = schema.Validate(invoiceXml); err != nil {
		return ValidationError{err.(xsd.SchemaValidationError).Errors()}
	}

	return nil
}

func (v *XsdValidator) IsSimple(invoiceXml types.Document, documentType string) bool {
	var schema *xsd.Schema
	switch documentType {
	case entity.InvoiceDocumentType:
		schema = v.ubl21SimpleSchema
	case entity.CreditNoteDocumentType:
		schema = v.ubl21SimpleCreditNoteSchema
	}

	if err := schema.Validate(invoiceXml); err != nil {
		return false
	} else {
		return true
	}
}

type rootTag struct {
	XMLName xml.Name
}

func (v *XsdValidator) GetFormatAndType(rawInvoice []byte) (string, string, error) {
	invoiceRootTag := &rootTag{}
	err := xml.Unmarshal(rawInvoice, &invoiceRootTag)
	if err != nil {
		return "", "", err
	}

	switch invoiceRootTag.XMLName.Local {
	case "Invoice":
		return entity.UblFormat, entity.InvoiceDocumentType, nil
	case "CreditNote":
		return entity.UblFormat, entity.CreditNoteDocumentType, nil
	case "CrossIndustryInvoice":
		return entity.D16bFormat, entity.InvoiceDocumentType, nil
	default:
		return "", "", errors.New("format.unknown")
	}
}
