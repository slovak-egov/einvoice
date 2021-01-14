package db

import (
	"github.com/slovak-egov/einvoice/pkg/dbutil"
)

type Connector struct {
	*dbutil.Connector
}

func NewConnector(dbConfig dbutil.Configuration) *Connector {
	return &Connector{dbutil.NewConnector(dbConfig)}
}
