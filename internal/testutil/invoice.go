package testutil

import (
	goContext "context"
	"testing"
	"time"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func CreateInvoice(t *testing.T, connector *dbutil.Connector, ctx goContext.Context, test, isPublic bool) *entity.Invoice {
	t.Helper()

	user := CreateUser(t, connector, ctx, "")
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
		IsPublic:    isPublic,
	}

	if _, err := connector.GetDb(ctx).Model(invoice).Insert(invoice); err != nil {
		t.Fatal(err)
	}

	return invoice
}
