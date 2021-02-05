package xml_test

import (
	"io/ioutil"
	"testing"

	"github.com/lestrrat-go/libxml2/xsd"
)

func TestD16BValidation(t *testing.T) {
	bytes, err := ioutil.ReadFile("../../../xml/d16b/example/d16b_invoice.xml")
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
	bytes, err := ioutil.ReadFile("../../../xml/ubl2.1/example/invoice.xml")
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
