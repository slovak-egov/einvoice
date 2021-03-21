package testutil

import (
	goContext "context"
	"testing"
	"time"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

type TestInvoiceOption = func(*entity.Invoice)

func CreateInvoice(
	ctx goContext.Context, t *testing.T, connector *dbutil.Connector, id string, opts ...TestInvoiceOption,
) *entity.Invoice {
	t.Helper()

	user := CreateUser(ctx, t, connector, "")
	invoice := &entity.Invoice{
		Id:               id,
		Sender:           "sender",
		Receiver:         "receiver",
		Format:           entity.UblFormat,
		Amount:           10,
		AmountWithoutVat: 8,
		CustomerIco:      "11111111",
		SupplierIco:      "22222222",
		CreatedBy:        user.Id,
		IssueDate:        timeutil.Date{time.Date(2011, 9, 22, 0, 0, 0, 0, time.UTC)},
		Test:             false,
	}

	for _, opt := range opts {
		opt(invoice)
	}

	if _, err := connector.GetDb(ctx).Model(invoice).Insert(invoice); err != nil {
		t.Fatal(err)
	}

	return invoice
}

func WithTest(invoice *entity.Invoice) {
	invoice.Test = true
}

func WithAmount(amount float64) TestInvoiceOption {
	return func(invoice *entity.Invoice) {
		invoice.Amount = amount
	}
}

func WithAmountWithoutTax(amount float64) TestInvoiceOption {
	return func(invoice *entity.Invoice) {
		invoice.AmountWithoutVat = amount
	}
}

func WithIssueDate(date timeutil.Date) TestInvoiceOption {
	return func(invoice *entity.Invoice) {
		invoice.IssueDate = date
	}
}

func WithCustomerName(name string) TestInvoiceOption {
	return func(invoice *entity.Invoice) {
		invoice.Receiver = name
	}
}

func WithSupplierName(name string) TestInvoiceOption {
	return func(invoice *entity.Invoice) {
		invoice.Sender = name
	}
}
