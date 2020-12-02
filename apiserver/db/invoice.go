package db

import (
	goContext "context"
	"errors"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
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

func (c *Connector) GetInvoices(ctx goContext.Context, formats []string) ([]entity.Invoice, error) {
	invoices := []entity.Invoice{}
	query := c.GetDb(ctx).Model(&invoices)

	if len(formats) > 0 {
		query = query.Where("format IN (?)", pg.In(formats))
	}

	if err := query.Select(); err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":   err.Error(),
			"formats": formats,
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

func (c *Connector) GetUserInvoices(
	ctx goContext.Context,
	userId int,
	options *UserInvoicesOptions,
) ([]entity.Invoice, error) {
	requestedUris := icosToUris(options.Icos)
	invoices := []entity.Invoice{}
	accessibleUris := c.GetDb(ctx).Model(&entity.User{}).
		Join("LEFT JOIN substitutes ON owner_id = id").
		ColumnExpr("slovensko_sk_uri").
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("substitute_id = ?", userId).WhereOr("id = ?", userId), nil
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

	err := query.Select()

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getUserInvoices.failed")
		return nil, err
	}

	return invoices, nil
}
