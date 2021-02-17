package xsdValidator_test

import (
	"os"
	"testing"

	"github.com/slovak-egov/einvoice/internal/apiserver/xsdValidator"
)

var validator *xsdValidator.XsdValidator

func TestMain(m *testing.M) {
	validator = xsdValidator.New("../../../data/schemas/ubl2.1/xsd", "../../../data/schemas/d16b/xsd")

	result := m.Run()

	os.Exit(result)
}
