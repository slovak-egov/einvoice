package db

import (
	goContext "context"

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
