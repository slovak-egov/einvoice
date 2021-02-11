package db

import (
	"testing"
	"time"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func createTestInvoice(t *testing.T, test, isPublic bool) *entity.Invoice {
	t.Helper()
	user := createTestUser(t, "")
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

	if err := connector.CreateInvoice(ctx, invoice); err != nil {
		t.Fatal(err)
	}

	return invoice
}
