package db

import (
	"errors"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
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

func (connector *Connector) GetInvoices(formats []string) []entity.Invoice {
	invoices := []entity.Invoice{}
	query := connector.Db.Model(&invoices)

	if len(formats) > 0 {
		query = query.Where("format IN (?)", pg.In(formats))
	}


	if err := query.Select(); err != nil {
		log.WithField("error", err.Error()).Panic("db.getInvoices.failed")
	}

	return invoices
}

func (connector *Connector) GetInvoice(id int) *entity.Invoice {
	inv := &entity.Invoice{}
	err := connector.Db.Model(inv).Where("id = ?", id).Select(inv)
	if err == pg.ErrNoRows {
		return nil
	} else if err != nil {
		log.WithField("error", err.Error()).Panic("db.getInvoice.failed")
	}

	return inv
}

func (connector *Connector) CreateInvoice(invoice *entity.Invoice) error {
	_, err := connector.Db.Model(invoice).Insert(invoice)

	if err != nil {
		log.WithField("error", err.Error()).Error("db.createInvoice.failed")
	}

	return err
}

func (connector *Connector) GetUserInvoices(userId int, options *UserInvoicesOptions) []entity.Invoice {
	requestedUris := icosToUris(options.Icos)
	invoices := []entity.Invoice{}
	accessibleUris := connector.Db.Model(&entity.User{}).
		Join("LEFT JOIN substitutes ON owner_id = id").
		ColumnExpr("slovensko_sk_uri").
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("substitute_id = ?", userId).WhereOr("id = ?", userId), nil
		})

	if len(requestedUris) > 0 {
		accessibleUris = accessibleUris.Where("slovensko_sk_uri IN (?)", pg.In(requestedUris))
	}

	query := connector.Db.Model(&invoices).
		With("accessible_uris", accessibleUris).
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			subquery := q
			if options.Received {
				subquery = subquery.WhereOr("'ico://sk/' || customer_ico IN (?)", connector.Db.Model().Table("accessible_uris"))
			}
			if options.Supplied {
				subquery = subquery.WhereOr("'ico://sk/' || supplier_ico IN (?)", connector.Db.Model().Table("accessible_uris"))
			}
			return subquery, nil
		})

	if len(options.Formats) > 0 {
		query = query.Where("format IN (?)", pg.In(options.Formats))
	}

	err := query.Select()

	if err != nil {
		log.WithField("error", err.Error()).Panic("db.getUserInvoices.failed")
	}

	return invoices
}
