package db

import (
	goContext "context"
	"errors"
	"fmt"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
)

func (c *Connector) GetUser(ctx goContext.Context, id int) (*entity.User, error) {
	user := &entity.User{}
	err := c.GetDb(ctx).Model(user).Where("id = ?", id).Select(user)

	if errors.Is(err, pg.ErrNoRows) {
		return nil, &dbutil.NotFoundError{fmt.Sprintf("User %d not found", id)}
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

func (c *Connector) GetOrCreateUser(ctx goContext.Context, upvsUri, name string) (*entity.User, error) {
	user := &entity.User{UpvsUri: upvsUri, Name: name}
	_, err := c.GetDb(ctx).Model(user).
		Where("upvs_uri = ?", upvsUri).
		SelectOrInsert()

	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":   err.Error(),
			"name":    name,
			"upvsUri": upvsUri,
		}).Error("db.createUser")

		return nil, err
	}

	return user, err
}

func (c *Connector) accessibleUrisQuery(ctx goContext.Context, userId int) *orm.Query {
	return c.GetDb(ctx).Model(&entity.User{}).
		Join("LEFT JOIN substitutes ON owner_id = id").
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("substitute_id = ?", userId).WhereOr("id = ?", userId), nil
		}).
		Where("upvs_uri LIKE 'ico://sk/%'").
		Column("upvs_uri")
}

func (c *Connector) GetUserOrganizationIds(ctx goContext.Context, userId int) ([]string, error) {
	uris := []string{}
	err := c.accessibleUrisQuery(ctx, userId).Select(&uris)
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":  err.Error(),
			"userId": userId,
		}).Error("db.GetUserOrganizationIds.failed")

		return nil, err
	}

	icos := []string{}
	for _, uri := range uris {
		ico, err := entity.UriToIco(uri)
		if err == nil {
			icos = append(icos, ico)
		}
	}

	return icos, nil
}

func (c *Connector) GetUserUris(ctx goContext.Context, icos []string) ([]string, error) {
	requestedUris := entity.IcosToUris(icos)

	userIds := c.GetDb(ctx).Model((*entity.User)(nil)).
		Where("upvs_uri IN (?)", pg.In(requestedUris)).
		Column("id")

	allUris := []string{}
	err := c.GetDb(ctx).Model((*entity.User)(nil)).
		Column("upvs_uri").
		Distinct().
		With("user_ids", userIds).
		Join("LEFT JOIN substitutes ON substitute_id = id").
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("owner_id IN (SELECT * FROM user_ids)").WhereOr("id IN (SELECT * FROM user_ids)"), nil
		}).
		Select(&allUris)

	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":         err.Error(),
			"requestedUris": requestedUris,
		}).Error("db.getUserUris.failed")
		return nil, err
	}
	return allUris, nil
}
