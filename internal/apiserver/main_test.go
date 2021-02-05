package apiserver

import (
	"os"
	"testing"

	invoiceValidator "github.com/slovak-egov/einvoice/internal/apiserver/invoiceValidator/mock"
)

var a *App

func TestMain(m *testing.M) {
	a = NewApp()

	a.invoiceValidator = &invoiceValidator.TestInvoiceValidator{}

	result := m.Run()

	a.CloseResources()

	os.Exit(result)
}
