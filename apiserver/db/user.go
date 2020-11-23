package db

import (
	"github.com/go-pg/pg/v10"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/entity"
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

func (connector *Connector) GetUser(id int) (*entity.User, error) {
	user := &entity.User{}
	err := connector.Db.Model(user).Where("id = ?", id).Select(user)
	if err != nil {
		log.WithField("error", err.Error()).Warn("db.getUser")
		return nil, err
	}
	return user, nil
}

func (connector *Connector) GetSlovenskoSkUser(uri string) (*entity.User, error) {
	user := &entity.User{}
	err := connector.Db.Model(user).Where("slovensko_sk_uri = ?", uri).Select(user)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (connector *Connector) UpdateUser(updatedData *entity.User) *entity.User {
	_, err := connector.Db.Model(updatedData).WherePK().Returning("*").UpdateNotZero()

	if err != nil {
		log.WithField("error", err.Error()).Panic("db.updateUser.failed")
	}

	return updatedData
}

func (connector *Connector) CreateUser(slovenskoSkUri, name string) (*entity.User, error) {
	user := &entity.User{SlovenskoSkUri: slovenskoSkUri, Name: name}
	_, err := connector.Db.Model(user).Insert(user)

	if err != nil {
		log.WithField("error", err.Error()).Warn("db.createUser")
	}

	return user, err
}

func (connector *Connector) GetUserEmails(icos []string) ([]string, error) {
	var uris []string
	for _, ico := range icos {
		uris = append(uris, icoToUri(ico))
	}

	emails := []string{}
	err := connector.Db.Model((*entity.User)(nil)).
		Column("email").
		Where("email <> ''").
		Distinct().
		Where("slovensko_sk_uri IN (?)", pg.In(uris)).
		Select(&emails)

	if err != nil {
		log.WithField("error", err.Error()).Error("db.getUserEmails.failed")
		return nil, err
	}
	return emails, nil
}
