package config

import (
	"time"

	"github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/upvs"
	"github.com/slovak-egov/einvoice/internal/visualization"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/loggerutil"
)

var devConfig = Configuration{
	SleepTime: 1 * time.Minute,
	BatchSize: 1,
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
	Upvs: upvs.Configuration{
		Url:        "https://dev.upvs.einvoice.mfsr.sk",
		SsoSubject: "einvoice",
	},
	Visualization: visualization.Configuration{
		FontsDirectory: "data/fonts",
		TemplatePath:   "data/templates/invoice",
		CodeListPath:   "data/codeLists.json",
	},
	XsdPath: "data/schemas",
}

var prodConfig = Configuration{
	SleepTime: 5 * time.Minute,
	BatchSize: 10,
	Db: dbutil.Configuration{
		Port: 5432,
		Name: "einvoice",
	},
	Logger: loggerutil.Configuration{
		LogLevel:     logrus.InfoLevel,
		ElasticIndex: "notification-worker",
		Format:       "json",
	},
	LocalStorageBasePath: "/data",
	Upvs: upvs.Configuration{
		Url:        "https://dev.upvs.einvoice.mfsr.sk",
		SsoSubject: "einvoice",
	},
	Visualization: visualization.Configuration{
		FontsDirectory: "app/data/fonts",
		TemplatePath:   "app/data/templates/invoice",
		CodeListPath:   "app/data/codeLists.json",
	},
	XsdPath: "app/data/schemas",
}

var testConfig = Configuration{
	SleepTime: 1 * time.Minute,
	BatchSize: 1,
	Db: dbutil.Configuration{
		Host: "localhost",
		Port: 5432,
		Name: "test",
		User: "postgres",
	},
	Logger: loggerutil.Configuration{
		LogLevel: logrus.ErrorLevel,
		Format:   "text",
	},
	Visualization: visualization.Configuration{
		FontsDirectory: "../../data/fonts",
		TemplatePath:   "../../data/templates/invoice",
		CodeListPath:   "../../data/codeLists.json",
	},
	XsdPath: "../../data/schemas",
}
