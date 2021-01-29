package xml

import (
	"fmt"

	"github.com/lestrrat-go/libxml2"
	"github.com/lestrrat-go/libxml2/xsd"
	log "github.com/sirupsen/logrus"
)

type Validator interface {
	ValidateD16B(xml []byte) error
	ValidateUBL21(xml []byte) error
}

type ValidationError struct {
	Errors []error
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("Validation errors: %v", e.Errors)
}

type validator struct {
	d16bSchema  *xsd.Schema
	ubl21Schema *xsd.Schema
}

func NewValidator(ubl21XsdPath, d16bXsdPath string) Validator {
	d16bXsdMainFile := d16bXsdPath + "/data/standard/CrossIndustryInvoice_100pD16B.xsd"
	d16bSchema, err := xsd.ParseFromFile(d16bXsdMainFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.d16b.failed")
	}

	ubl21MainFile := ubl21XsdPath + "/maindoc/UBL-Invoice-2.1.xsd"
	ubl21Schema, err := xsd.ParseFromFile(ubl21MainFile)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("validator.parseSchema.ubl21.failed")
	}

	return &validator{d16bSchema, ubl21Schema}
}

func (validator *validator) ValidateD16B(src []byte) error {
	xml, err := libxml2.Parse(src)
	if err != nil {
		return err
	}

	if err = validator.d16bSchema.Validate(xml); err != nil {
		return ValidationError{err.(xsd.SchemaValidationError).Errors()}
	}

	return nil
}

func (validator *validator) ValidateUBL21(src []byte) error {
	xml, err := libxml2.Parse(src)
	if err != nil {
		return err
	}

	if err = validator.ubl21Schema.Validate(xml); err != nil {
		return ValidationError{err.(xsd.SchemaValidationError).Errors()}
	}

	return nil
}
