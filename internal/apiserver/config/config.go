package config

import (
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/cache"
	"github.com/slovak-egov/einvoice/internal/upvs"
	"github.com/slovak-egov/einvoice/internal/visualization"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/environment"
	"github.com/slovak-egov/einvoice/pkg/loggerutil"
)

type ApiKeyConfiguration struct {
	MaxExpiration time.Duration
	JtiExpiration time.Duration
}

type Configuration struct {
	Db                   dbutil.Configuration
	Host                 string
	Port                 int
	XsdPath              string
	DataPath             string
	LocalStorageBasePath string
	ServerReadTimeout    time.Duration
	ServerWriteTimeout   time.Duration
	GracefulTimeout      time.Duration
	Cache                cache.Configuration
	Upvs                 upvs.Configuration
	InvoicesLimit        int
	ApiKey               ApiKeyConfiguration
	Logger               loggerutil.Configuration
	ValidationServerUrl  string
	MaxInvoiceSize       int64
	DraftExpiration      time.Duration
	DraftsLimit          int
	Visualization        visualization.Configuration
}

func New() *Configuration {
	apiserverEnv := environment.Getenv("APISERVER_ENV", "")
	var config Configuration
	switch apiserverEnv {
	case "prod":
		config = prodConfig
	case "dev":
		config = devConfig
	case "test":
		config = testConfig
	default:
		log.WithField("environment", apiserverEnv).Fatal("config.environment.unknown")
	}

	config.Logger = loggerutil.NewConfig(config.Logger)
	// Send logs to elastic
	config.Logger.ConnectElastic()

	config.Db = dbutil.NewConfig(config.Db)
	config.Cache = cache.NewConfig(config.Cache)
	config.Upvs = upvs.NewConfig(config.Upvs)
	config.Visualization = visualization.NewConfig(config.Visualization)

	config.Host = environment.Getenv("HOST", config.Host)
	config.Port = environment.ParseInt("PORT", config.Port)

	config.XsdPath = environment.Getenv("XSD_PATH", config.XsdPath)
	config.DataPath = environment.Getenv("DATA_PATH", config.DataPath)

	config.LocalStorageBasePath = environment.Getenv("LOCAL_STORAGE_BASE_PATH", config.LocalStorageBasePath)

	config.ServerReadTimeout = environment.ParseDuration("SERVER_READ_TIMEOUT", config.ServerReadTimeout)
	config.ServerWriteTimeout = environment.ParseDuration("SERVER_WRITE_TIMEOUT", config.ServerWriteTimeout)
	config.GracefulTimeout = environment.ParseDuration("GRACEFUL_TIMEOUT", config.GracefulTimeout)

	config.InvoicesLimit = environment.ParseInt("INVOICES_LIMIT", config.InvoicesLimit)
	config.ApiKey.MaxExpiration = environment.ParseDuration("API_KEY_MAX_EXPIRATION", config.ApiKey.MaxExpiration)
	config.ApiKey.JtiExpiration = environment.ParseDuration("API_KEY_JTI_EXPIRATION", config.ApiKey.JtiExpiration)

	config.ValidationServerUrl = environment.Getenv("VALIDATION_SERVER_URL", config.ValidationServerUrl)

	config.MaxInvoiceSize = environment.ParseInt64("MAX_INVOICE_SIZE", config.MaxInvoiceSize)

	config.DraftExpiration = environment.ParseDuration("DRAFT_EXPIRATION", config.DraftExpiration)
	config.DraftsLimit = environment.ParseInt("DRAFTS_LIMIT", config.DraftsLimit)

	log.Info("config.loaded")

	return &config
}
