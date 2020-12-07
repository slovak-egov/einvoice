package db

import (
	goContext "context"
	"errors"
	"fmt"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

type PublicInvoicesOptions struct {
	Formats []string
	NextId  int
	Limit   int
}

func (r *PublicInvoicesOptions) Validate(maxLimit int) error {
	if r.Limit <= 0 || r.Limit > maxLimit {
		return fmt.Errorf("limit should be positive integer less than or equal to %d", maxLimit)
	}

	return nil
}

type UserInvoicesOptions struct {
	UserId   int
	Received bool
	Supplied bool
	Icos     []string
	*PublicInvoicesOptions
}

func (r *UserInvoicesOptions) Validate(maxLimit int) error {
	if !r.Received && !r.Supplied {
		return errors.New("Either received or supplied should be requested")
	}
	return r.PublicInvoicesOptions.Validate(maxLimit)
}

func (c *Connector) GetInvoices(ctx goContext.Context, options *PublicInvoicesOptions) ([]entity.Invoice, error) {
	invoices := []entity.Invoice{}
	query := c.GetDb(ctx).Model(&invoices).Order("id DESC").Limit(options.Limit + 1)

	if len(options.Formats) > 0 {
		query = query.Where("format IN (?)", pg.In(options.Formats))
	}

	// If next id is not provided, do not search by id
	if options.NextId != 0 {
		query = query.Where("id <= ?", options.NextId)
	}

	if err := query.Select(); err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":   err.Error(),
			"formats": options.Formats,
		}).Error("db.getInvoices.failed")
		return nil, err
	}

	return invoices, nil
}

func (c *Connector) GetInvoice(ctx goContext.Context, id int) (*entity.Invoice, error) {
	inv := &entity.Invoice{}
	err := c.GetDb(ctx).Model(inv).Where("id = ?", id).Select(inv)
	if errors.Is(err, pg.ErrNoRows) {
		return nil, handlerutil.NewNotFoundError("Invoice not found")
	} else if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getInvoice.failed")
		return nil, err
	}

	return inv, nil
}

func (c *Connector) CreateInvoice(ctx goContext.Context, invoice *entity.Invoice) error {
	_, err := c.GetDb(ctx).Model(invoice).Insert(invoice)

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.createInvoice.failed")
	}

	return err
}

func (c *Connector) GetUserInvoices(ctx goContext.Context, options *UserInvoicesOptions) ([]entity.Invoice, error) {
	requestedUris := icosToUris(options.Icos)
	invoices := []entity.Invoice{}
	accessibleUris := c.GetDb(ctx).Model(&entity.User{}).
		Join("LEFT JOIN substitutes ON owner_id = id").
		ColumnExpr("slovensko_sk_uri").
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("substitute_id = ?", options.UserId).WhereOr("id = ?", options.UserId), nil
		})

	if len(requestedUris) > 0 {
		accessibleUris = accessibleUris.Where("slovensko_sk_uri IN (?)", pg.In(requestedUris))
	}

	query := c.GetDb(ctx).Model(&invoices).
		With("accessible_uris", accessibleUris).
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			subquery := q
			if options.Received {
				subquery = subquery.WhereOr("'ico://sk/' || customer_ico IN (?)", c.GetDb(ctx).Model().Table("accessible_uris"))
			}
			if options.Supplied {
				subquery = subquery.WhereOr("'ico://sk/' || supplier_ico IN (?)", c.GetDb(ctx).Model().Table("accessible_uris"))
			}
			return subquery, nil
		})

	if len(options.Formats) > 0 {
		query = query.Where("format IN (?)", pg.In(options.Formats))
	}

	// If next id is not provided, do not search by id
	if options.NextId != 0 {
		query = query.Where("id <= ?", options.NextId)
	}

	err := query.Order("id DESC").Limit(options.Limit + 1).Select()

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getUserInvoices.failed")
		return nil, err
	}

	return invoices, nil
}
