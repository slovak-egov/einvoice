package db

import (
	goContext "context"
	"fmt"

	"github.com/go-pg/pg/v10"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/config"
)

type Connector struct {
	Db *pg.DB
}

func NewConnector(dbConfig config.DbConfiguration) *Connector {
	db := pg.Connect(&pg.Options{
		Addr:     fmt.Sprintf("%s:%d", dbConfig.Host, dbConfig.Port),
		User:     dbConfig.User,
		Password: dbConfig.Password,
		Database: dbConfig.Name,
	})

	if err := db.Ping(goContext.Background()); err != nil {
		log.WithField("dbConfig", dbConfig).Fatal("db.connection.failed")
	} else {
		log.Info("db.connection.successful")
	}

	if dbConfig.LogQueries {
		db.AddQueryHook(dbLogger{})
	}

	return &Connector{db}
}

func (c *Connector) Close() {
	c.Db.Close()
}
