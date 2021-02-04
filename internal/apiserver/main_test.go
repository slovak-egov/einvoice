package apiserver

import (
	"os"
	"testing"
)

var a *App

func TestMain(m *testing.M) {
	a = NewApp()

	a.invoiceValidator = &TestInvoiceValidator{}

	result := m.Run()

	a.CloseResources()

	os.Exit(result)
}
