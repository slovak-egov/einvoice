package worker

import (
	goContext "context"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/notification-worker/config"
	"github.com/slovak-egov/einvoice/internal/storage"
	"github.com/slovak-egov/einvoice/internal/upvs"
	"github.com/slovak-egov/einvoice/internal/visualization"
	"github.com/slovak-egov/einvoice/internal/xsdValidator"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type Worker struct {
	config     *config.Configuration
	db         *db.Connector
	storage    *storage.LocalStorage
	upvs       *upvs.Connector
	visualizer *visualization.Visualizer
}

func New() *Worker {
	workerConfig := config.New()

	dbConnector := db.NewConnector(workerConfig.Db)
	storageConnector := storage.New(workerConfig.LocalStorageBasePath)
	validator := xsdValidator.New(workerConfig.XsdPath)

	return &Worker{
		config:     workerConfig,
		db:         dbConnector,
		storage:    storageConnector,
		upvs:       upvs.New(workerConfig.Upvs),
		visualizer: visualization.New(workerConfig.Visualization, storageConnector, dbConnector, validator),
	}
}

func (w *Worker) Run() {
	log.Info("worker.started")

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

	var invoices []entity.Invoice

	_ = w.db.RunInTransaction(ctx, func(ctx goContext.Context) (err error) {
		// Get invoices parties were not notified yet
		invoices, err = w.db.GetAndUpdateNotNotifiedInvoices(ctx, w.config.BatchSize)
		return err
	})

	if len(invoices) == 0 {
		context.GetLogger(ctx).Info("worker.checkInvoices.noNewInvoices")
		return
	}

	notifiedInvoiceIds := []string{}
	notNotifiedInvoiceIds := []string{}

	// send invoices notifications
	for _, invoice := range invoices {
		err := w.notifyInvoiceParties(ctx, &invoice)
		if err == nil {
			notifiedInvoiceIds = append(notifiedInvoiceIds, invoice.Id)
		} else {
			notNotifiedInvoiceIds = append(notNotifiedInvoiceIds, invoice.Id)
		}
	}

	// Mark notified invoices
	if len(notifiedInvoiceIds) > 0 {
		err := w.db.UpdateNotificationStatus(ctx, notifiedInvoiceIds, entity.NotificationStatusSent)
		if err == nil {
			context.GetLogger(ctx).WithField("invoiceIds", notifiedInvoiceIds).Info("worker.checkInvoices.notified")
		}
	} else {
		context.GetLogger(ctx).Warn("worker.checkInvoices.noNotification")
	}

	// Mark not notified invoices
	if len(notNotifiedInvoiceIds) > 0 {
		err := w.db.UpdateNotificationStatus(ctx, notNotifiedInvoiceIds, entity.NotificationStatusNotSent)
		if err == nil {
			context.GetLogger(ctx).
				WithField("invoiceIds", notNotifiedInvoiceIds).
				Error("worker.checkInvoices.notNotified")
		}
	}
}

func (w *Worker) notifyInvoiceParties(ctx goContext.Context, invoice *entity.Invoice) error {
	uris, err := w.db.GetUserUris(ctx, []string{invoice.SupplierIco, invoice.CustomerIco})
	if err != nil {
		return err
	}

	invoiceXml, err := w.storage.GetInvoice(ctx, invoice.Id)
	if err != nil {
		context.GetLogger(ctx).
			WithFields(log.Fields{
				"invoiceId": invoice.Id,
				"error":     err.Error(),
			}).
			Error("worker.checkInvoices.notifyInvoiceParties.getXml.failed")

		return err
	}

	invoiceZipBytes, err := w.visualizer.GetOrCreateVisualization(ctx, invoice)
	if err != nil {
		context.GetLogger(ctx).
			WithFields(log.Fields{
				"invoiceId": invoice.Id,
				"error":     err.Error(),
			}).
			Error("worker.checkInvoices.notifyInvoiceParties.getOrCreateVisualization.failed")

		return err
	}

	for _, uri := range uris {
		skTalkMessage, err := upvs.CreateInvoiceNotificationMessage(
			ctx,
			w.config.NotificationSenderUri,
			uri,
			invoice.Id,
			invoiceXml,
			invoiceZipBytes,
		)
		if err != nil {
			context.GetLogger(ctx).
				WithFields(log.Fields{
					"error":       err.Error(),
					"invoiceId":   invoice.Id,
					"receiverUri": uri,
				}).
				Error("worker.checkInvoices.notifyInvoiceParties.createMessage.failed")

			return err
		}

		err = w.upvs.SendInvoiceNotification(ctx, skTalkMessage)
		if err != nil {
			context.GetLogger(ctx).
				WithFields(log.Fields{
					"error":       err.Error(),
					"invoiceId":   invoice.Id,
					"receiverUri": uri,
				}).
				Error("worker.checkInvoices.notifyInvoiceParties.sendMessage.failed")

			return err
		}

		context.GetLogger(ctx).
			WithFields(log.Fields{
				"invoiceId":   invoice.Id,
				"receiverUri": uri,
			}).
			Debug("worker.checkInvoices.notifyInvoiceParties.message.sent")
	}

	return nil
}
