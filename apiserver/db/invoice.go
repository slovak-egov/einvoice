package db

import (
	goContext "context"
	"errors"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type UserInvoicesOptions struct {
	Received bool
	Supplied bool
	Icos     []string
	Formats  []string
}

func (r *UserInvoicesOptions) Validate() error {
	if !r.Received && !r.Supplied {
		return errors.New("Either received or supplied should be requested")
	}
	return nil
}

func (c *Connector) GetInvoices(ctx goContext.Context, formats []string) []entity.Invoice {
	invoices := []entity.Invoice{}
	query := c.Db.Model(&invoices)

	if len(formats) > 0 {
		query = query.Where("format IN (?)", pg.In(formats))
	}


	if err := query.Select(); err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Panic("db.getInvoices.failed")
	}

	return invoices
}

func (c *Connector) GetInvoice(ctx goContext.Context, id int) *entity.Invoice {
	inv := &entity.Invoice{}
	err := c.Db.Model(inv).Where("id = ?", id).Select(inv)
	if err == pg.ErrNoRows {
		return nil
	} else if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Panic("db.getInvoice.failed")
	}

	return inv
}

func (c *Connector) CreateInvoice(ctx goContext.Context, invoice *entity.Invoice) error {
	_, err := c.Db.Model(invoice).Insert(invoice)

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.createInvoice.failed")
	}

	return err
}

func (c *Connector) GetUserInvoices(ctx goContext.Context, userId int, options *UserInvoicesOptions) []entity.Invoice {
	requestedUris := icosToUris(options.Icos)
	invoices := []entity.Invoice{}
	accessibleUris := c.Db.Model(&entity.User{}).
		Join("LEFT JOIN substitutes ON owner_id = id").
		ColumnExpr("slovensko_sk_uri").
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("substitute_id = ?", userId).WhereOr("id = ?", userId), nil
		})

	if len(requestedUris) > 0 {
		accessibleUris = accessibleUris.Where("slovensko_sk_uri IN (?)", pg.In(requestedUris))
	}

	query := c.Db.Model(&invoices).
		With("accessible_uris", accessibleUris).
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			subquery := q
			if options.Received {
				subquery = subquery.WhereOr("'ico://sk/' || customer_ico IN (?)", c.Db.Model().Table("accessible_uris"))
			}
			if options.Supplied {
				subquery = subquery.WhereOr("'ico://sk/' || supplier_ico IN (?)", c.Db.Model().Table("accessible_uris"))
			}
			return subquery, nil
		})

	if len(options.Formats) > 0 {
		query = query.Where("format IN (?)", pg.In(options.Formats))
	}

	err := query.Select()

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Panic("db.getUserInvoices.failed")
	}

	return invoices
}
