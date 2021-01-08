package worker

import (
	goContext "context"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/storage"
	"github.com/slovak-egov/einvoice/cleanupWorker/config"
	"github.com/slovak-egov/einvoice/cleanupWorker/db"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type Worker struct {
	config  *config.Configuration
	db      *db.Connector
	storage *storage.LocalStorage
}

func New() *Worker {
	workerConfig := config.New()
	return &Worker{
		workerConfig,
		db.NewConnector(workerConfig.Db),
		storage.New(workerConfig.LocalStorageBasePath),
	}
}

func (w *Worker) Run() {
	log.Info("worker.started")

	for range time.Tick(w.config.CronInterval) {
		w.TestInvoicesCleanupJob()
	}
}

func (w *Worker) CloseResources() {
	w.db.Close()
}

func (w *Worker) TestInvoicesCleanupJob() {
	ctx := goContext.Background()

	invoiceIds, err := w.db.DeleteOldTestInvoices(ctx, w.config.TestInvoiceExpiration)
	if err != nil {
		context.GetLogger(ctx).
			WithField("error", err.Error()).
			Error("worker.testInvoices.cleanupJob.db.failed")
		return
	}

	if err = w.storage.DeleteInvoices(ctx, invoiceIds); err != nil {
		context.GetLogger(ctx).
			WithField("error", err.Error()).
			Error("worker.testInvoices.cleanupJob.storage.failed")
		return
	}

	context.GetLogger(ctx).
		WithField("invoiceIds", invoiceIds).
		Error("worker.testInvoices.cleanupJob.done")
}
