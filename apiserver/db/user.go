package db

import (
	goContext "context"
	"errors"
	"strings"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

func icoToUri(ico string) string {
	return "ico://sk/" + ico
}

func icosToUris(icos []string) []string {
	uris := []string{}
	for _, ico := range icos {
		uris = append(uris, icoToUri(ico))
	}
	return uris
}

func uriToIco(uri string) (string, error) {
	if !strings.HasPrefix(uri, "ico://sk/") {
		return "", errors.New("not valid ico uri")
	} else {
		return uri[9:], nil
	}
}

func (c *Connector) GetUser(ctx goContext.Context, id int) (*entity.User, error) {
	user := &entity.User{}
	err := c.GetDb(ctx).Model(user).Where("id = ?", id).Select(user)

	if errors.Is(err, pg.ErrNoRows) {
		return nil, handlerutil.NewNotFoundError("User not found")
	} else if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.getUser")
		return nil, err
	}

	return user, nil
}

func (c *Connector) UpdateUser(ctx goContext.Context, updatedData *entity.User) (*entity.User, error) {
	_, err := c.GetDb(ctx).Model(updatedData).WherePK().Returning("*").UpdateNotZero()

	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("db.updateUser.failed")
		return nil, err
	}

	return updatedData, nil
}

func (c *Connector) GetOrCreateUser(ctx goContext.Context, slovenskoSkUri, name string) (*entity.User, error) {
	user := &entity.User{SlovenskoSkUri: slovenskoSkUri, Name: name}
	_, err := c.GetDb(ctx).Model(user).
		Where("slovensko_sk_uri = ?", slovenskoSkUri).
		SelectOrInsert()

	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":          err.Error(),
			"name":           name,
			"slovenskoSkUri": slovenskoSkUri,
		}).Error("db.createUser")

		return nil, err
	}

	return user, err
}

func (c *Connector) GetUserEmails(ctx goContext.Context, icos []string) ([]string, error) {
	uris := icosToUris(icos)

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

func (c *Connector) accessibleUrisQuery(ctx goContext.Context, userId int) *orm.Query {
	return c.GetDb(ctx).Model(&entity.User{}).
		Join("LEFT JOIN substitutes ON owner_id = id").
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("substitute_id = ?", userId).WhereOr("id = ?", userId), nil
		}).
		Where("slovensko_sk_uri LIKE 'ico://sk/%'").
		Column("slovensko_sk_uri")
}

func (c *Connector) GetUserOrganizationIds(ctx goContext.Context, userId int) ([]string, error) {
	uris := []string{}
	err := c.accessibleUrisQuery(ctx, userId).Select(&uris)
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error": err.Error(),
			"userId": userId,
		}).Error("db.GetUserOrganizationIds.failed")

		return nil, err
	}

	icos := []string{}
	for _, uri := range uris {
		ico, err := uriToIco(uri)
		if err == nil {
			icos = append(icos, ico)
		}
	}

	return icos, nil
}
