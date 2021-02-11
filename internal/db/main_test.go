package db

import (
	"context"
	"os"
	"testing"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
)

var ctx context.Context

var connector *Connector

func cleanDb(t *testing.T) func() {
	return func() {
		if _, err := connector.GetDb(ctx).Model(&entity.Substitute{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}

		if _, err := connector.GetDb(ctx).Model(&entity.User{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}

		if _, err := connector.GetDb(ctx).Model(&entity.Invoice{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}
	}
}

func TestMain(m *testing.M) {
	ctx = context.Background()

	defaultConfig := dbutil.Configuration{
		Host: "localhost",
		Port: 5432,
		Name: "test",
	}

	connector = NewConnector(dbutil.NewConfig(defaultConfig))

	result := m.Run()

	connector.Close()

	os.Exit(result)
}
