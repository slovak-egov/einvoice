package dbutil

import (
	goContext "context"
	"fmt"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/context"
)

type Connector struct {
	db *pg.DB
}

func NewConnector(config Configuration) *Connector {
	db := pg.Connect(&pg.Options{
		Addr:     fmt.Sprintf("%s:%d", config.Host, config.Port),
		User:     config.User,
		Password: config.Password,
		Database: config.Name,
	})

	if err := db.Ping(goContext.Background()); err != nil {
		log.WithField("dbConfig", config).Fatal("db.connection.failed")
	} else {
		log.Info("db.connection.successful")
	}

	if config.LogQueries {
		db.AddQueryHook(Logger{})
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
