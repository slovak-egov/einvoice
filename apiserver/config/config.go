package config

import (
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/environment"
	"github.com/slovak-egov/einvoice/pkg/loggerutil"
)

type CacheConfiguration struct {
	Host                             string
	Port                             int
	Password                         string
	SessionTokenExpiration           time.Duration
	TestInvoiceRateLimiterExpiration time.Duration
	TestInvoiceRateLimiterThreshold  int
}

type SlovenskoSkConfiguration struct {
	Url                string
	ApiTokenPrivateKey string
	OboTokenPublicKey  string
	LogoutCallbackUrl  string
}

type ApiKeyConfiguration struct {
	MaxExpiration time.Duration
	JtiExpiration time.Duration
}

type Configuration struct {
	Db                   dbutil.Configuration
	Host                 string
	Port                 int
	D16bXsdPath          string
	Ubl21XsdPath         string
	LocalStorageBasePath string
	ServerReadTimeout    time.Duration
	ServerWriteTimeout   time.Duration
	GracefulTimeout      time.Duration
	Cache                CacheConfiguration
	SlovenskoSk          SlovenskoSkConfiguration
	InvoicesLimit        int
	ApiKey               ApiKeyConfiguration
	Logger               loggerutil.Configuration
}

func newCache(defaultConfig CacheConfiguration) CacheConfiguration {
	return CacheConfiguration{
		Host:                             environment.Getenv("CACHE_HOST", defaultConfig.Host),
		Port:                             environment.ParseInt("CACHE_PORT", defaultConfig.Port),
		Password:                         environment.Getenv("CACHE_PASSWORD", defaultConfig.Password),
		SessionTokenExpiration:           environment.ParseDuration(
			"SESSION_TOKEN_EXPIRATION", defaultConfig.SessionTokenExpiration,
		),
		TestInvoiceRateLimiterExpiration: environment.ParseDuration(
			"TEST_INVOICE_RATE_LIMITER_EXPIRATION", defaultConfig.TestInvoiceRateLimiterExpiration,
		),
		TestInvoiceRateLimiterThreshold:  environment.ParseInt(
			"TEST_INVOICE_RATE_LIMITER_THRESHOLD", defaultConfig.TestInvoiceRateLimiterThreshold,
		),
	}
}

func newSlovenskoSk(defaultConfig SlovenskoSkConfiguration) SlovenskoSkConfiguration {
	return SlovenskoSkConfiguration{
		Url:                environment.Getenv("SLOVENSKO_SK_URL", defaultConfig.Url),
		ApiTokenPrivateKey: environment.Getenv("API_TOKEN_PRIVATE", defaultConfig.ApiTokenPrivateKey),
		OboTokenPublicKey:  environment.Getenv("OBO_TOKEN_PUBLIC", defaultConfig.OboTokenPublicKey),
		LogoutCallbackUrl:  environment.Getenv("LOGOUT_CALLBACK_URL", defaultConfig.LogoutCallbackUrl),
	}
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
	config.Cache = newCache(config.Cache)
	config.SlovenskoSk = newSlovenskoSk(config.SlovenskoSk)

	config.Host = environment.Getenv("HOST", config.Host)
	config.Port = environment.ParseInt("PORT", config.Port)

	config.D16bXsdPath = environment.Getenv("D16B_XSD_PATH", config.D16bXsdPath)
	config.Ubl21XsdPath = environment.Getenv("UBL21_XSD_PATH", config.Ubl21XsdPath)

	config.LocalStorageBasePath = environment.Getenv("LOCAL_STORAGE_BASE_PATH", config.LocalStorageBasePath)

	config.ServerReadTimeout = environment.ParseDuration("SERVER_READ_TIMEOUT", config.ServerReadTimeout)
	config.ServerWriteTimeout = environment.ParseDuration("SERVER_WRITE_TIMEOUT", config.ServerWriteTimeout)
	config.GracefulTimeout = environment.ParseDuration("GRACEFUL_TIMEOUT", config.GracefulTimeout)

	config.InvoicesLimit = environment.ParseInt("INVOICES_LIMIT", config.InvoicesLimit)
	config.ApiKey.MaxExpiration = environment.ParseDuration("API_KEY_MAX_EXPIRATION", config.ApiKey.MaxExpiration)
	config.ApiKey.JtiExpiration = environment.ParseDuration("API_KEY_JTI_EXPIRATION", config.ApiKey.JtiExpiration)

	log.Info("config.loaded")

	return &config
}
