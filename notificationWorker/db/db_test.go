package db

import (
	"context"
	"testing"

	"github.com/slovak-egov/einvoice/notificationWorker/config"
	"github.com/slovak-egov/einvoice/pkg/entity"
)

var ctx = context.Background()

var conf = config.New()

var connector = NewConnector(conf.Db)

func cleanDb(t *testing.T) func() {
	return func() {
		if _, err := connector.GetDb(ctx).Model(&entity.Substitute{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}

		if _, err := connector.GetDb(ctx).Model(&entity.User{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}
	}
}
