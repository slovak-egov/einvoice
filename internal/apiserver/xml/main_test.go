package xml_test

import (
	"os"
	"testing"

	"github.com/slovak-egov/einvoice/internal/apiserver/xml"
)

var validator xml.Validator

func TestMain(m *testing.M) {
	validator = xml.NewValidator("../../../xml/ubl2.1/xsd", "../../../xml/d16b/xsd")

	result := m.Run()

	os.Exit(result)
}
