package db

import (
	goContext "context"
	"errors"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/context"
)

func NewSubstitutes(ownerId int, substituteIds []int) *[]entity.Substitute {
	substitutes := []entity.Substitute{}
	for _, id := range substituteIds {
		substitutes = append(
			substitutes,
			entity.Substitute{OwnerId: ownerId, SubstituteId: id},
		)
	}
	return &substitutes
}

func (c *Connector) AddUserSubstitutes(ctx goContext.Context, ownerId int, substituteIds []int) ([]int, error) {
	substitutes := NewSubstitutes(ownerId, substituteIds)
	addedSubstituteIds := []int{}
	_, err := c.GetDb(ctx).Model(substitutes).
		OnConflict("DO NOTHING").
		Returning("substitute_id").
		Insert(&addedSubstituteIds)

	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":         err.Error(),
			"ownerId":       ownerId,
			"substituteIds": substituteIds,
		}).Warn("db.addSubstitutes")

		var e pg.Error
		if errors.As(err, &e) && e.IntegrityViolation() {
			return nil, &IntegrityViolationError{"Some of substitutes do not exist"}
		} else {
			return nil, err
		}
	}
	return addedSubstituteIds, nil
}

func (c *Connector) RemoveUserSubstitutes(ctx goContext.Context, ownerId int, substituteIds []int) ([]int, error) {
	deletedSubstituteIds := []int{}
	_, err := c.GetDb(ctx).Model(&entity.Substitute{}).
		Where("owner_id = ?", ownerId).
		Where("substitute_id IN (?)", pg.In(substituteIds)).
		Returning("substitute_id").
		Delete(&deletedSubstituteIds)
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":         err.Error(),
			"ownerId":       ownerId,
			"substituteIds": substituteIds,
		}).Error("db.removeSubstitutes")

		return nil, err
	}
	return deletedSubstituteIds, nil
}

func (c *Connector) GetUserSubstitutes(ctx goContext.Context, ownerId int) ([]int, error) {
	substituteIds := []int{}
	err := c.GetDb(ctx).Model(&entity.Substitute{}).
		Column("substitute_id").
		Where("owner_id = ?", ownerId).
		Select(&substituteIds)

	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":   err.Error(),
			"ownerId": ownerId,
		}).Error("db.getSubstitutes")

		return nil, err
	}
	return substituteIds, nil
}

func (c *Connector) GetUserOrganizationIds(ctx goContext.Context, userId int) ([]string, error) {
	uris := []string{}
	err := c.GetDb(ctx).Model(&entity.User{}).
		Join("LEFT JOIN substitutes ON owner_id = id").
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("substitute_id = ?", userId).WhereOr("id = ?", userId), nil
		}).
		Where("slovensko_sk_uri LIKE 'ico://sk/%'").
		Column("slovensko_sk_uri").
		Select(&uris)

	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":  err.Error(),
			"userId": userId,
		}).Error("db.GetUserOrganizations")

		return nil, err
	}

	icos := []string{}
	for _, uri := range uris {
		ico, err := uriToIco(uri)
		if err != nil {
			return nil, err
		}
		icos = append(icos, ico)
	}

	return icos, nil
}

func (c *Connector) IsValidSubstitute(ctx goContext.Context, userId int, ico string) error {
	count, err := c.GetDb(ctx).Model(&entity.User{}).
		Join("LEFT JOIN substitutes ON owner_id = id").
		Where("slovensko_sk_uri = ?", icoToUri(ico)).
		WhereGroup(func(q *orm.Query) (*orm.Query, error) {
			return q.WhereOr("substitute_id = ?", userId).WhereOr("id = ?", userId), nil
		}).
		Count()

	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":  err.Error(),
			"ico":    ico,
			"userId": userId,
		}).Error("db.isValidSubstitute.failed")

		return err
	}

	if count == 0 {
		return &NoSubstituteError{"No valid substitutes found"}
	}

	return nil
}
