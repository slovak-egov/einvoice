package db

import (
	goContext "context"

	"github.com/go-pg/pg/v10"
	log "github.com/sirupsen/logrus"
)

type dbLogger struct {}

func (dbLogger) BeforeQuery(ctx goContext.Context, q *pg.QueryEvent) (goContext.Context, error) {
	return ctx, nil
}

func (dbLogger) AfterQuery(ctx goContext.Context, q *pg.QueryEvent) error {
	query, err := q.FormattedQuery()
	if err != nil {
		return err
	}
	log.WithField("query", string(query)).Debug("db.query")
	return nil
}
