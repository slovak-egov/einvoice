package db

import (
	goContext "context"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/testutil"
)

func assertInvoiceNotificationStatus(t *testing.T, id int, status string) {
	inv, err := connector.GetInvoice(ctx, id)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, status, inv.NotificationsStatus)
}

func TestGetAndUpdateNotNotifiedInvoices(t *testing.T) {
	t.Cleanup(testutil.CleanDb(t, connector.Connector, ctx))

	inv1 := testutil.CreateInvoice(t, connector.Connector, ctx, false, true)
	inv2 := testutil.CreateInvoice(t, connector.Connector, ctx, false, true)
	inv3 := testutil.CreateInvoice(t, connector.Connector, ctx, false, true)
	inv4 := testutil.CreateInvoice(t, connector.Connector, ctx, false, true)
	inv5 := testutil.CreateInvoice(t, connector.Connector, ctx, false, true)

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
			assert.ElementsMatch(t, []int{inv1.Id, inv2.Id}, []int{invoices[0].Id, invoices[1].Id})

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
			assert.ElementsMatch(t, []int{inv3.Id, inv4.Id}, []int{invoices[0].Id, invoices[1].Id})

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

	assertInvoiceNotificationStatus(t, inv1.Id, entity.NotificationStatusSending)
	assertInvoiceNotificationStatus(t, inv2.Id, entity.NotificationStatusSending)
	assertInvoiceNotificationStatus(t, inv3.Id, entity.NotificationStatusSending)
	assertInvoiceNotificationStatus(t, inv4.Id, entity.NotificationStatusSending)
	assertInvoiceNotificationStatus(t, inv5.Id, entity.NotificationStatusNotSent)
}

func TestUpdateNotificationStatus(t *testing.T) {
	t.Cleanup(testutil.CleanDb(t, connector.Connector, ctx))

	inv1 := testutil.CreateInvoice(t, connector.Connector, ctx, false, true)
	inv2 := testutil.CreateInvoice(t, connector.Connector, ctx, false, true)
	inv3 := testutil.CreateInvoice(t, connector.Connector, ctx, false, true)

	err := connector.UpdateNotificationStatus(ctx, []int{inv1.Id, inv2.Id}, "sent")
	if err != nil {
		t.Fatal(err)
	}

	assertInvoiceNotificationStatus(t, inv1.Id, entity.NotificationStatusSent)
	assertInvoiceNotificationStatus(t, inv2.Id, entity.NotificationStatusSent)
	assertInvoiceNotificationStatus(t, inv3.Id, entity.NotificationStatusNotSent)
}
