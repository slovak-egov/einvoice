package db

import (
	goContext "context"
	"time"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/entity"
)

func (c *Connector) DeleteOldTestInvoices(ctx goContext.Context, expiration time.Duration) ([]int, error) {
	invoiceIds := []int{}
	query := c.GetDb(ctx).Model(&entity.Invoice{}).
		Where("test = TRUE").
		Where("created_at < ?", time.Now().Add(-expiration)).
		Returning("id")

	if _, err := query.Delete(&invoiceIds); err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.deleteOldTestInvoices.failed")
		return nil, err
	}

	return invoiceIds, nil
}
