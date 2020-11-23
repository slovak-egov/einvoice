package xml_test

import (
	"io/ioutil"
	"testing"

	"github.com/lestrrat-go/libxml2/xsd"

	"github.com/slovak-egov/einvoice/apiserver/config"
	"github.com/slovak-egov/einvoice/apiserver/xml"
)

func TestD16BValidation(t *testing.T) {
	validator := xml.NewValidator(&config.Configuration{
		D16bXsdPath:  "../../xml/d16b/xsd",
		Ubl21XsdPath: "../../xml/ubl21/xsd",
	})

	bytes, err := ioutil.ReadFile("../../xml/d16b/example/d16b_invoice.xml")
	if err != nil {
		t.Fatal(err)
	}

	if err = validator.ValidateD16B(bytes); err != nil {
		switch v := err.(type) {
		case xsd.SchemaValidationError:
			t.Error(v.Errors())
		default:
			t.Error(err)
		}
	}
}

func TestUBL21Validation(t *testing.T) {
	validator := xml.NewValidator(&config.Configuration{
		D16bXsdPath:  "../../xml/d16b/xsd",
		Ubl21XsdPath: "../../xml/ubl21/xsd",
	})

	bytes, err := ioutil.ReadFile("../../xml/ubl21/example/ubl21_invoice.xml")
	if err != nil {
		t.Fatal(err)
	}

	if err = validator.ValidateUBL21(bytes); err != nil {
		switch v := err.(type) {
		case xsd.SchemaValidationError:
			t.Error(v.Errors())
		default:
			t.Error(err)
		}
	}
}
