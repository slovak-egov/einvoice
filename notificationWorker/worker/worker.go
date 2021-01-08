package worker

import (
	goContext "context"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/storage"
	"github.com/slovak-egov/einvoice/notificationWorker/config"
	"github.com/slovak-egov/einvoice/notificationWorker/db"
	"github.com/slovak-egov/einvoice/notificationWorker/mail"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/entity"
)

type Worker struct {
	config  *config.Configuration
	db      *db.Connector
	mail    *mail.Sender
	storage *storage.LocalStorage
}

func New() *Worker {
	workerConfig := config.New()
	return &Worker{
		workerConfig,
		db.NewConnector(workerConfig.Db),
		mail.NewSender(workerConfig.Mail),
		storage.New(workerConfig.LocalStorageBasePath),
	}
}

func (w *Worker) Run() {
	log.Info("worker.started")

	go w.TestInvoicesCleanupCron()

	for {
		w.checkInvoices()

		// In future we can keep sending notifications and sleep only if there are none left
		time.Sleep(w.config.SleepTime)
	}
}

func (w *Worker) CloseResources() {
	w.db.Close()
}

func (w *Worker) checkInvoices() {
	ctx := goContext.Background()
	// Get invoices parties were not notified yet
	invoices, err := w.db.GetNotNotifiedInvoices(ctx, w.config.BatchSize)
	if err != nil {
		return
	}

	if len(invoices) == 0 {
		context.GetLogger(ctx).Info("worker.checkInvoices.noNewInvoices")
		return
	}

	notifiedInvoiceIds := []int{}

	// send invoices notifications
	for _, invoice := range invoices {
		err := w.notifyInvoiceParties(ctx, invoice)
		if err == nil {
			notifiedInvoiceIds = append(notifiedInvoiceIds, invoice.Id)
		}
	}

	// Mark notified invoices
	if len(notifiedInvoiceIds) > 0 {
		w.db.MarkNotifiedInvoices(ctx, notifiedInvoiceIds)
		context.GetLogger(ctx).WithField("invoiceIds", notifiedInvoiceIds).Info("worker.checkInvoices.notified")
	} else {
		context.GetLogger(ctx).Warn("worker.checkInvoices.noNotification")
	}
}

func (w *Worker) notifyInvoiceParties(ctx goContext.Context, invoice entity.Invoice) error {
	emails, err := w.db.GetUserEmails(ctx, []string{invoice.SupplierIco, invoice.CustomerIco})
	if err != nil {
		return err
	}

	if len(emails) > 0 {
		invoiceXml, err := w.storage.GetInvoice(ctx, invoice.Id)
		if err != nil {
			context.GetLogger(ctx).
				WithField("invoiceId", invoice.Id).
				Error("worker.checkInvoices.notifyInvoiceParties.getXml.failed")

			return err
		}

		err = w.mail.SendInvoice(ctx, invoice.Id, emails, invoiceXml)
		if err != nil {
			return err
		}
	} else {
		context.GetLogger(ctx).
			WithField("invoiceId", invoice.Id).
			Debug("worker.checkInvoices.notifyInvoiceParties.noEmails")
	}

	return nil
}

func (w *Worker) TestInvoicesCleanupCron() {
	w.TestInvoicesCleanupJob()

	for range time.Tick(24 * time.Hour) {
		w.TestInvoicesCleanupJob()
	}
}

func (w *Worker) TestInvoicesCleanupJob() {
	ctx := goContext.Background()

	err := w.db.RunInTransaction(ctx, func(ctx goContext.Context) error {
		invoices, err := w.db.GetOldTestInvoices(ctx, w.config.TestInvoiceExpiration)
		if err != nil {
			return err
		}

		invoiceIds := []int{}
		for _, invoice := range invoices {
			invoiceIds = append(invoiceIds, invoice.Id)
		}

		if err = w.db.DeleteInvoices(ctx, invoiceIds); err != nil {
			return err
		}

		if err = w.storage.DeleteInvoices(ctx, invoiceIds); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		context.GetLogger(ctx).
			WithField("error", err.Error()).
			Error("worker.testInvoices.cleanupJob.failed")
	}
}
