package db

import (
	goContext "context"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/entity"
)

func (c *Connector) GetUserEmails(ctx goContext.Context, icos []string) ([]string, error) {
	uris := entity.IcosToUris(icos)

	organizationIds := c.GetDb(ctx).Model((*entity.User)(nil)).
		Where("slovensko_sk_uri IN (?)", pg.In(uris)).
		Column("id").
		Distinct()

	emails := []string{}
	err := c.GetDb(ctx).Model((*entity.User)(nil)).
		Column("email").
		Where("email <> ''").
		Distinct().
		With("organizations", organizationIds).
		Join("LEFT JOIN substitutes ON substitute_id = id").
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("owner_id IN (SELECT * FROM organizations)").WhereOr("id IN (SELECT * FROM organizations)"), nil
		}).
		Select(&emails)

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getUserEmails.failed")
		return nil, err
	}
	return emails, nil
}
