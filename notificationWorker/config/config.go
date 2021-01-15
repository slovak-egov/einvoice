package config

import (
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/environment"
	"github.com/slovak-egov/einvoice/pkg/loggerutil"
)

type Configuration struct {
	Db                   dbutil.Configuration
	SleepTime            time.Duration
	BatchSize            int
	Mail                 MailConfiguration
	LocalStorageBasePath string
	Logger               loggerutil.Configuration
}

type MailConfiguration struct {
	PublicKey  string
	PrivateKey string
	Email      string
}

func newMail(defaultConfig MailConfiguration) MailConfiguration {
	return MailConfiguration{
		PublicKey:  environment.Getenv("MAIL_APIKEY_PUBLIC", defaultConfig.PublicKey),
		PrivateKey: environment.Getenv("MAIL_APIKEY_PRIVATE", defaultConfig.PrivateKey),
		Email:      environment.Getenv("MAIL_ADDRESS", defaultConfig.Email),
	}
}

func New() *Configuration {
	workerEnv := environment.Getenv("NOTIFICATION_WORKER_ENV", "")
	var config Configuration
	switch workerEnv {
	case "prod":
		config = prodConfig
	case "dev":
		config = devConfig
	case "test":
		config = testConfig
	default:
		log.WithField("environment", workerEnv).Fatal("config.environment.unknown")
	}

	config.Logger = loggerutil.NewConfig(config.Logger)
	// Send logs to elastic
	config.Logger.ConnectElastic()

	config.Db = dbutil.NewConfig(config.Db)
	config.Mail = newMail(config.Mail)
	config.BatchSize = environment.ParseInt("BATCH_SIZE", config.BatchSize)
	config.SleepTime = environment.ParseDuration("SLEEP_TIME", config.SleepTime)
	config.LocalStorageBasePath = environment.Getenv("LOCAL_STORAGE_BASE_PATH", config.LocalStorageBasePath)

	return &config
}
