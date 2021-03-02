package testutil

import (
	goContext "context"
	"testing"
	"time"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func CreateInvoice(ctx goContext.Context, t *testing.T, connector *dbutil.Connector, test bool) *entity.Invoice {
	t.Helper()

	user := CreateUser(ctx, t, connector, "")
	invoice := &entity.Invoice{
		Sender:      "sender",
		Receiver:    "receiver",
		Format:      entity.UblFormat,
		Price:       1,
		CustomerIco: "11111111",
		SupplierIco: "22222222",
		CreatedBy:   user.Id,
		IssueDate:   timeutil.Date{time.Date(2011, 9, 22, 0, 0, 0, 0, time.UTC)},
		Test:        test,
	}

	if _, err := connector.GetDb(ctx).Model(invoice).Insert(invoice); err != nil {
		t.Fatal(err)
	}

	return invoice
}
