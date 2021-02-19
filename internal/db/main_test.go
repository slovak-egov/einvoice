package db

import (
	"context"
	"os"
	"testing"

	"github.com/slovak-egov/einvoice/pkg/dbutil"
)

var ctx context.Context

var connector *Connector

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
