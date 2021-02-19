package db

import (
	goContext "context"

	"github.com/go-pg/pg/v10"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
)

func (c *Connector) GetAndUpdateNotNotifiedInvoices(ctx goContext.Context, limit int) ([]entity.Invoice, error) {
	invoices := []entity.Invoice{}
	notUpdatedInvoices := c.GetDb(ctx).
		Model(&entity.Invoice{}).
		Column("id").
		Where("notifications_status = ?", entity.NotificationStatusNotSent).
		Order("id ASC").
		Limit(limit).
		For("UPDATE SKIP LOCKED")

	query := c.GetDb(ctx).
		Model(&invoices).
		Set("notifications_status = 'sending'").
		Where("id IN (?)", notUpdatedInvoices).
		Returning("id, customer_ico, supplier_ico")

	if _, err := query.Update(); err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getNotNotifiedInvoices.failed")
		return nil, err
	}

	return invoices, nil
}

func (c *Connector) UpdateNotificationStatus(ctx goContext.Context, invoiceIds []int, status string) error {
	query := c.GetDb(ctx).
		Model(&entity.Invoice{}).
		Set("notifications_status = ?", status).
		Where("id IN (?)", pg.In(invoiceIds))

	if _, err := query.Update(); err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":      err.Error(),
			"invoiceIds": invoiceIds,
			"status":     status,
		}).Error("db.updateNotificationStatus.failed")
		return err
	}

	return nil
}
