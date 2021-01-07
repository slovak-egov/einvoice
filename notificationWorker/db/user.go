package db

import (
	goContext "context"

	"github.com/go-pg/pg/v10"

	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/entity"
)

func (c *Connector) GetUserEmails(ctx goContext.Context, icos []string) ([]string, error) {
	uris := entity.IcosToUris(icos)

	emails := []string{}
	err := c.GetDb(ctx).Model((*entity.User)(nil)).
		Column("email").
		Where("email <> ''").
		Distinct().
		Where("slovensko_sk_uri IN (?)", pg.In(uris)).
		Select(&emails)

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getUserEmails.failed")
		return nil, err
	}
	return emails, nil
}
