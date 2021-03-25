package db

import (
	goContext "context"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/testutil"
)

func assertInvoiceNotificationStatus(t *testing.T, id string, status string) {
	inv, err := connector.GetInvoice(ctx, id)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, status, inv.NotificationsStatus)
}

// Test if two parallel invoice updates update different invoices
func TestGetAndUpdateNotNotifiedInvoices(t *testing.T) {
	t.Cleanup(testutil.CleanDb(ctx, t, connector.Connector))

	ids := []string{
		"01776d7e-4661-138a-26e3-437102097b13", "01776d7e-4661-138a-26e3-437102097b14",
		"01776d7e-4661-138a-26e3-437102097b15", "01776d7e-4661-138a-26e3-437102097b16",
		"01776d7e-4661-138a-26e3-437102097b17",
	}
	testutil.CreateInvoice(ctx, t, connector.Connector, ids[0])
	testutil.CreateInvoice(ctx, t, connector.Connector, ids[1])
	testutil.CreateInvoice(ctx, t, connector.Connector, ids[2])
	testutil.CreateInvoice(ctx, t, connector.Connector, ids[3])
	testutil.CreateInvoice(ctx, t, connector.Connector, ids[4])

	stopTx1 := make(chan bool, 1)
	startTx2 := make(chan bool, 1)
	finishedTx1 := make(chan bool, 1)
	go func() {
		defer func() {
			finishedTx1 <- true
		}()

		err := connector.RunInTransaction(ctx, func(ctx goContext.Context) error {
			invoices, err := connector.GetAndUpdateNotNotifiedInvoices(ctx, 2)

			startTx2 <- true
			<-stopTx1

			if err != nil {
				return err
			}
			assert.Equal(t, 2, len(invoices))
			assert.ElementsMatch(t, []string{ids[0], ids[1]}, []string{invoices[0].Id, invoices[1].Id})

			return nil
		})

		if err != nil {
			t.Fatal(err)
		}
	}()

	stopTx2 := make(chan bool, 1)
	finishedTx2 := make(chan bool, 1)
	go func() {
		<-startTx2
		defer func() {
			finishedTx2 <- true
		}()

		err := connector.RunInTransaction(ctx, func(ctx goContext.Context) error {
			invoices, err := connector.GetAndUpdateNotNotifiedInvoices(ctx, 2)

			<-stopTx2

			if err != nil {
				return err
			}
			assert.Equal(t, 2, len(invoices))
			assert.ElementsMatch(t, []string{ids[2], ids[3]}, []string{invoices[0].Id, invoices[1].Id})

			return nil
		})

		if err != nil {
			t.Fatal(err)
		}
	}()

	stopTx1 <- true
	stopTx2 <- true

	<-finishedTx1
	<-finishedTx2

	assertInvoiceNotificationStatus(t, ids[0], entity.NotificationStatusSending)
	assertInvoiceNotificationStatus(t, ids[1], entity.NotificationStatusSending)
	assertInvoiceNotificationStatus(t, ids[2], entity.NotificationStatusSending)
	assertInvoiceNotificationStatus(t, ids[3], entity.NotificationStatusSending)
	assertInvoiceNotificationStatus(t, ids[4], entity.NotificationStatusNotSent)
}

func TestUpdateNotificationStatus(t *testing.T) {
	t.Cleanup(testutil.CleanDb(ctx, t, connector.Connector))

	ids := []string{
		"01776d7e-4661-138a-26e3-437102097b13", "01776d7e-4661-138a-26e3-437102097b14",
		"01776d7e-4661-138a-26e3-437102097b15",
	}
	testutil.CreateInvoice(ctx, t, connector.Connector, ids[0])
	testutil.CreateInvoice(ctx, t, connector.Connector, ids[1])
	testutil.CreateInvoice(ctx, t, connector.Connector, ids[2])

	err := connector.UpdateNotificationStatus(ctx, []string{ids[0], ids[1]}, entity.NotificationStatusSent)
	if err != nil {
		t.Fatal(err)
	}

	assertInvoiceNotificationStatus(t, ids[0], entity.NotificationStatusSent)
	assertInvoiceNotificationStatus(t, ids[1], entity.NotificationStatusSent)
	assertInvoiceNotificationStatus(t, ids[2], entity.NotificationStatusNotSent)
}
