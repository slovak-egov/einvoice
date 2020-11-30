package db

import (
	goContext "context"

	"github.com/go-pg/pg/v10"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
)

func icoToUri(ico string) string {
	return "ico://sk/"+ico
}

func icosToUris(icos []string) []string {
	uris := []string{}
	for _, ico := range icos {
		uris = append(uris, icoToUri(ico))
	}
	return uris
}

func (c *Connector) GetUser(ctx goContext.Context, id int) (*entity.User, error) {
	user := &entity.User{}
	err := c.Db.Model(user).Where("id = ?", id).Select(user)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Warn("db.getUser")
		return nil, err
	}
	return user, nil
}

func (c *Connector) GetSlovenskoSkUser(uri string) (*entity.User, error) {
	user := &entity.User{}
	err := c.Db.Model(user).Where("slovensko_sk_uri = ?", uri).Select(user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (c *Connector) UpdateUser(ctx goContext.Context, updatedData *entity.User) *entity.User {
	_, err := c.Db.Model(updatedData).WherePK().Returning("*").UpdateNotZero()

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Panic("db.updateUser.failed")
	}

	return updatedData
}

func (c *Connector) CreateUser(ctx goContext.Context, slovenskoSkUri, name string) (*entity.User, error) {
	user := &entity.User{SlovenskoSkUri: slovenskoSkUri, Name: name}
	_, err := c.Db.Model(user).Insert(user)

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Warn("db.createUser")
	}

	return user, err
}

func (c *Connector) GetUserEmails(ctx goContext.Context, icos []string) ([]string, error) {
	var uris []string
	for _, ico := range icos {
		uris = append(uris, icoToUri(ico))
	}

	emails := []string{}
	err := c.Db.Model((*entity.User)(nil)).
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
