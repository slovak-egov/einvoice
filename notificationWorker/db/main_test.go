package db

import (
	"context"
	"os"
	"testing"

	"github.com/slovak-egov/einvoice/notificationWorker/config"
	"github.com/slovak-egov/einvoice/pkg/entity"
)

var ctx context.Context

var conf *config.Configuration

var connector *Connector

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

func TestMain(m *testing.M) {
	ctx = context.Background()

	conf = config.New()

	connector = NewConnector(conf.Db)

	result := m.Run()

	connector.Close()

	os.Exit(result)
}
