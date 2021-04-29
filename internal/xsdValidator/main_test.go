package xsdValidator_test

import (
	"os"
	"testing"

	"github.com/slovak-egov/einvoice/internal/xsdValidator"
)

var validator *xsdValidator.XsdValidator

func TestMain(m *testing.M) {
	validator = xsdValidator.New("../../data/schemas")

	result := m.Run()

	os.Exit(result)
}
