package config

import (
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/environment"
)

type Urls struct {
	ApiServer        string
	SlovenskoSkLogin string
}

type Configuration struct {
	Port                int
	Urls                Urls
	ClientBuildDir      string
	LogLevel            log.Level
}

func New() *Configuration {
	webserverEnv := environment.Getenv("WEBSERVER_ENV", "")
	var config Configuration
	switch webserverEnv {
	case "prod":
		config = prodConfig
	case "dev":
		config = devConfig
	default:
		log.WithField("environment", webserverEnv).Fatal("config.environment.unknown")
	}

	log.SetFormatter(&log.JSONFormatter{})
	var err error
	logLevel := environment.Getenv("LOG_LEVEL", config.LogLevel.String())
	config.LogLevel, err = log.ParseLevel(logLevel)
	if err != nil {
		log.WithField("logLevel", logLevel).Fatal("config.logLevel.unknown")
	}

	config.Port = environment.ParseInt("PORT", config.Port)
	config.ClientBuildDir = environment.Getenv("CLIENT_BUILD_DIR", config.ClientBuildDir)
	config.Urls = Urls{
		ApiServer: environment.Getenv("API_SERVER_URL", config.Urls.ApiServer),
		SlovenskoSkLogin: environment.Getenv("SLOVENSKO_SK_LOGIN_URL", config.Urls.SlovenskoSkLogin),
	}

	log.Info("config.loaded")
	return &config
}
