package db

import (
	goContext "context"
	"fmt"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/config"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type Connector struct {
	db *pg.DB
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

func (c *Connector) GetDb(ctx goContext.Context) orm.DB {
	tx := context.GetTransaction(ctx)
	if tx != nil {
		return tx
	}

	return c.db
}

func (c *Connector) RunInTransaction(ctx goContext.Context, fn func(goContext.Context) error) error {
	return c.db.RunInTransaction(ctx, func(tx *pg.Tx) error {
		return fn(context.AddTransaction(ctx, tx))
	})
}

func (c *Connector) Close() {
	c.db.Close()
}
