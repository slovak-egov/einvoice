package config

import (
	"time"

	"github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/loggerutil"
)

var devConfig = Configuration{
	Db: dbutil.Configuration{
		Host: "localhost",
		Port: 5432,
		Name: "einvoice",
		User: "postgres",
	},
	Logger: loggerutil.Configuration{
		LogLevel: logrus.DebugLevel,
		Format:   "text",
	},
	TestInvoiceExpiration: 7 * 24 * time.Hour,
	Interval:              1 * time.Hour,
}

var prodConfig = Configuration{
	Db: dbutil.Configuration{
		Port: 5432,
		Name: "einvoice",
	},
	Logger: loggerutil.Configuration{
		LogLevel:     logrus.InfoLevel,
		ElasticIndex: "cleanup-worker",
		Format:       "json",
	},
	LocalStorageBasePath:  "/data",
	TestInvoiceExpiration: 7 * 24 * time.Hour,
	Interval:              1 * time.Hour,
}
