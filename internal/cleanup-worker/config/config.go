package config

import (
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/environment"
	"github.com/slovak-egov/einvoice/pkg/loggerutil"
)

type Configuration struct {
	Db                    dbutil.Configuration
	LocalStorageBasePath  string
	Logger                loggerutil.Configuration
	TestInvoiceExpiration time.Duration
	CronInterval          time.Duration
}

func New() *Configuration {
	workerEnv := environment.Getenv("CLEANUP_WORKER_ENV", "")
	var config Configuration
	switch workerEnv {
	case "prod":
		config = prodConfig
	case "dev":
		config = devConfig
	default:
		log.WithField("environment", workerEnv).Fatal("config.environment.unknown")
	}

	config.Logger = loggerutil.NewConfig(config.Logger)
	// Send logs to elastic
	config.Logger.ConnectElastic()

	config.Db = dbutil.NewConfig(config.Db)
	config.LocalStorageBasePath = environment.Getenv("LOCAL_STORAGE_BASE_PATH", config.LocalStorageBasePath)
	config.TestInvoiceExpiration = environment.ParseDuration("TEST_INVOICE_EXPIRATION", config.TestInvoiceExpiration)
	config.CronInterval = environment.ParseDuration("CRON_INTERVAL", config.CronInterval)

	return &config
}
