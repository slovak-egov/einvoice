package xsdValidator

import (
	"errors"
	"strings"

	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/xsd"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/entity"
)

type XsdValidator struct {
	ubl21Schema           *xsd.Schema
	ubl21CreditNoteSchema *xsd.Schema
	d16bSchema            *xsd.Schema
}

func New(ubl21XsdPath, d16bXsdPath string) *XsdValidator {
	d16bXsdMainFile := d16bXsdPath + "/data/standard/CrossIndustryInvoice_100pD16B.xsd"
	d16bSchema, err := xsd.ParseFromFile(d16bXsdMainFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.d16b.failed")
	}

	ubl21MainFile := ubl21XsdPath + "/maindoc/UBL-Invoice-2.1.xsd"
	ubl21Schema, err := xsd.ParseFromFile(ubl21MainFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.ubl2.1.failed")
	}

	ubl21CreditNoteFile := ubl21XsdPath + "/maindoc/UBL-CreditNote-2.1.xsd"
	ubl21CreditNoteSchema, err := xsd.ParseFromFile(ubl21CreditNoteFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.ubl2.1.failed")
	}

	return &XsdValidator{
		ubl21Schema:           ubl21Schema,
		ubl21CreditNoteSchema: ubl21CreditNoteSchema,
		d16bSchema:            d16bSchema,
	}
}

func (v *XsdValidator) Validate(src []byte, format, documentType string) error {
	xml, err := libxml2.Parse(src)
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

	if err = schema.Validate(xml); err != nil {
		return ValidationError{err.(xsd.SchemaValidationError).Errors()}
	}

	return nil
}

func (v *XsdValidator) GetFormatAndType(src []byte) (string, string, error) {
	xml, err := libxml2.Parse(src)
	if err != nil {
		return "", "", err
	}
	root, err := xml.FirstChild()
	if err != nil {
		return "", "", err
	}
	rootNameParts := strings.Split(root.NodeName(), ":")

	switch rootNameParts[len(rootNameParts)-1] {
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
