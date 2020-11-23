package db

import (
	"fmt"

	"github.com/go-pg/pg/v10"

	"github.com/slovak-egov/einvoice/apiserver/config"
)

type Connector struct {
	Db *pg.DB
}

func NewConnector(dbConfig config.DbConfiguration) *Connector {
	return &Connector{
		Db: pg.Connect(&pg.Options{
			Addr:     fmt.Sprintf("%s:%d", dbConfig.Host, dbConfig.Port),
			User:     dbConfig.User,
			Password: dbConfig.Password,
			Database: dbConfig.Name,
		}),
	}
}

func (connector *Connector) Close() {
	connector.Db.Close()
}
