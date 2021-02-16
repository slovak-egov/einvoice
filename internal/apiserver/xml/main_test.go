package xml_test

import (
	"os"
	"testing"

	"github.com/slovak-egov/einvoice/internal/apiserver/xml"
)

var validator *xml.XsdValidator

func TestMain(m *testing.M) {
	validator = xml.NewXsdValidator("../../../data/schemas/ubl2.1/xsd", "../../../data/schemas/d16b/xsd")

	result := m.Run()

	os.Exit(result)
}
