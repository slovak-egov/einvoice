package config

import (
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/environment"
)

type MailConfiguration struct {
	PublicKey  string
	PrivateKey string
	Email      string
}

type DbConfiguration struct {
	Host       string
	Port       int
	Name       string
	User       string
	Password   string
	LogQueries bool
}

type CacheConfiguration struct {
	Host                   string
	Port                   int
	Password               string
	SessionTokenExpiration time.Duration
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
	Db                   DbConfiguration
	Port                 int
	D16bXsdPath          string
	Ubl21XsdPath         string
	LocalStorageBasePath string
	GcsBucket            string
	LogLevel             log.Level
	Mail                 MailConfiguration
	ServerReadTimeout    time.Duration
	ServerWriteTimeout   time.Duration
	GracefulTimeout      time.Duration
	Cache                CacheConfiguration
	SlovenskoSk          SlovenskoSkConfiguration
	InvoicesLimit        int
	ApiKey               ApiKeyConfiguration
}

func (c *Configuration) initDb() {
	c.Db = DbConfiguration{
		Host:       environment.Getenv("DB_HOST", c.Db.Host),
		Port:       environment.ParseInt("DB_PORT", c.Db.Port),
		Name:       environment.Getenv("DB_NAME", c.Db.Name),
		User:       environment.Getenv("DB_USER", c.Db.User),
		Password:   environment.Getenv("DB_PASSWORD", c.Db.Password),
		LogQueries: environment.ParseBool("DB_LOG_QUERIES", c.Db.LogQueries),
	}
}

func (c *Configuration) initMail() {
	c.Mail = MailConfiguration{
		PublicKey:  environment.Getenv("MAIL_APIKEY_PUBLIC", c.Mail.PublicKey),
		PrivateKey: environment.Getenv("MAIL_APIKEY_PRIVATE", c.Mail.PrivateKey),
		Email:      environment.Getenv("MAIL_ADDRESS", c.Mail.Email),
	}
}

func (c *Configuration) initCache() {
	c.Cache = CacheConfiguration{
		Host:                   environment.Getenv("CACHE_HOST", c.Cache.Host),
		Port:                   environment.ParseInt("CACHE_PORT", c.Cache.Port),
		Password:               environment.Getenv("CACHE_PASSWORD", c.Cache.Password),
		SessionTokenExpiration: environment.ParseDuration("SESSION_TOKEN_EXPIRATION", c.Cache.SessionTokenExpiration),
	}
}

func (c *Configuration) initSlovenskoSk() {
	c.SlovenskoSk = SlovenskoSkConfiguration{
		Url:                environment.Getenv("SLOVENSKO_SK_URL", c.SlovenskoSk.Url),
		ApiTokenPrivateKey: environment.Getenv("API_TOKEN_PRIVATE", c.SlovenskoSk.ApiTokenPrivateKey),
		OboTokenPublicKey:  environment.Getenv("OBO_TOKEN_PUBLIC", c.SlovenskoSk.OboTokenPublicKey),
		LogoutCallbackUrl:  environment.Getenv("LOGOUT_CALLBACK_URL", c.SlovenskoSk.LogoutCallbackUrl),
	}
}

func New() *Configuration {
	apiserverEnv := environment.Getenv("APISERVER_ENV", "")
	var config Configuration
	switch apiserverEnv {
	case "prod":
		config = prodConfig
		// Use different formatting in production, which can be easily processed by elasticsearch
		log.SetFormatter(&log.JSONFormatter{})
	case "dev":
		config = devConfig
	case "test":
		config = testConfig
	default:
		log.WithField("environment", apiserverEnv).Fatal("config.environment.unknown")
	}

	var err error
	logLevel := environment.Getenv("LOG_LEVEL", config.LogLevel.String())
	config.LogLevel, err = log.ParseLevel(logLevel)
	if err != nil {
		log.WithField("logLevel", logLevel).Fatal("config.logLevel.unknown")
	}
	log.SetLevel(config.LogLevel)

	config.initDb()
	config.initMail()
	config.initCache()
	config.initSlovenskoSk()

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
