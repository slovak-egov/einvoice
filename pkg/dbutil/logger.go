package dbutil

import (
	goContext "context"

	"github.com/go-pg/pg/v10"
	log "github.com/sirupsen/logrus"
)

type Logger struct {}

func (Logger) BeforeQuery(ctx goContext.Context, q *pg.QueryEvent) (goContext.Context, error) {
	return ctx, nil
}

func (Logger) AfterQuery(ctx goContext.Context, q *pg.QueryEvent) error {
	query, err := q.FormattedQuery()
	if err != nil {
		return err
	}
	log.WithField("query", string(query)).Debug("db.query")
	return nil
}
