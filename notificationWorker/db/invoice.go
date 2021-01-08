package db

import (
	goContext "context"
	"time"

	"github.com/go-pg/pg/v10"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/entity"
)

func (c *Connector) GetNotNotifiedInvoices(ctx goContext.Context, limit int) ([]entity.Invoice, error) {
	invoices := []entity.Invoice{}
	query := c.GetDb(ctx).Model(&invoices).
		Column("id", "customer_ico", "supplier_ico").
		Where("notifications_sent = FALSE").
		Order("id ASC").
		Limit(limit)

	if err := query.Select(); err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getNotNotifiedInvoices.failed")
		return nil, err
	}

	return invoices, nil
}

func (c *Connector) MarkNotifiedInvoices(ctx goContext.Context, invoiceIds []int) error {
	query := c.GetDb(ctx).
		Model(&entity.Invoice{}).
		Set("notifications_sent = TRUE").
		Where("id IN (?)", pg.In(invoiceIds))

	if _, err := query.Update(); err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.markNotifiedInvoices.failed")
		return err
	}

	return nil
}

func (c *Connector) GetOldTestInvoices(ctx goContext.Context, expiration time.Duration) ([]entity.Invoice, error) {
	invoices := []entity.Invoice{}
	query := c.GetDb(ctx).Model(&invoices).
		Column("id").
		Where("test = TRUE").
		Where("created_at < ?", time.Now().Add(-expiration))

	if err := query.Select(); err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getOldTestInvoices.failed")
		return nil, err
	}

	return invoices, nil
}

func (c *Connector) DeleteInvoices(ctx goContext.Context, ids []int) error {
	if len(ids) == 0 {
		return nil
	}

	query := c.GetDb(ctx).
		Model(&entity.Invoice{}).
		Where("id IN (?)", pg.In(ids))

	if _, err := query.Delete(); err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.deleteInvoices.failed")
		return err
	}

	return nil
}
