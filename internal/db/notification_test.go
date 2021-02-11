package db

import (
	goContext "context"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
)

func testInvoiceStatus(t *testing.T, id int, status string) {
	inv, err := connector.GetInvoice(ctx, id)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, status, inv.NotificationsStatus)
}

func TestGetAndUpdateNotNotifiedInvoices(t *testing.T) {
	t.Cleanup(cleanDb(t))

	inv1 := createTestInvoice(t, false, true)
	inv2 := createTestInvoice(t, false, true)
	inv3 := createTestInvoice(t, false, true)
	inv4 := createTestInvoice(t, false, true)
	inv5 := createTestInvoice(t, false, true)

	stopTx1 := make(chan bool, 1)
	startTx2 := make(chan bool, 1)
	finishedTx1 := make(chan bool, 1)
	go func() {
		err := connector.RunInTransaction(ctx, func(ctx goContext.Context) error {
			invoices, err := connector.GetAndUpdateNotNotifiedInvoices(ctx, 2)
			if err != nil {
				return err
			}

			assert.Equal(t, 2, len(invoices))
			inv1.NotificationsStatus = "sending"
			inv2.NotificationsStatus = "sending"
			assert.Equal(t, []entity.Invoice{*inv1, *inv2}, invoices)

			startTx2 <- true
			<-stopTx1
			return nil
		})

		if err != nil {
			t.Fatal(err)
		}

		finishedTx1 <- true
	}()

	stopTx2 := make(chan bool, 1)
	finishedTx2 := make(chan bool, 1)
	go func() {
		<-startTx2

		err := connector.RunInTransaction(ctx, func(ctx goContext.Context) error {
			invoices, err := connector.GetAndUpdateNotNotifiedInvoices(ctx, 2)
			if err != nil {
				return err
			}

			assert.Equal(t, 2, len(invoices))
			inv3.NotificationsStatus = "sending"
			inv4.NotificationsStatus = "sending"
			assert.Equal(t, []entity.Invoice{*inv3, *inv4}, invoices)

			<-stopTx2
			return nil
		})

		if err != nil {
			t.Fatal(err)
		}

		finishedTx2 <- true
	}()

	stopTx1 <- true
	stopTx2 <- true

	<-finishedTx1
	<-finishedTx2

	testInvoiceStatus(t, inv1.Id, "sending")
	testInvoiceStatus(t, inv2.Id, "sending")
	testInvoiceStatus(t, inv3.Id, "sending")
	testInvoiceStatus(t, inv4.Id, "sending")
	testInvoiceStatus(t, inv5.Id, "not_sent")
}

func TestUpdateNotificationStatus(t *testing.T) {
	t.Cleanup(cleanDb(t))

	inv1 := createTestInvoice(t, false, true)
	inv2 := createTestInvoice(t, false, true)
	inv3 := createTestInvoice(t, false, true)

	err := connector.UpdateNotificationStatus(ctx, []int{inv1.Id, inv2.Id}, "sent")
	if err != nil {
		t.Fatal(err)
	}

	testInvoiceStatus(t, inv1.Id, "sent")
	testInvoiceStatus(t, inv2.Id, "sent")
	testInvoiceStatus(t, inv3.Id, "not_sent")
}
