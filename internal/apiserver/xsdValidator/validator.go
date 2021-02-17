package xsdValidator

import (
	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/xsd"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/entity"
)

type XsdValidator struct {
	schemas map[string]*xsd.Schema
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

	return &XsdValidator{
		map[string]*xsd.Schema{entity.UblFormat: ubl21Schema, entity.D16bFormat: d16bSchema},
	}
}

func (v *XsdValidator) Validate(src []byte, format string) error {
	xml, err := libxml2.Parse(src)
	if err != nil {
		return err
	}

	if err = v.schemas[format].Validate(xml); err != nil {
		return ValidationError{err.(xsd.SchemaValidationError).Errors()}
	}

	return nil
}
