package config

import (
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/environment"
)

type Urls struct {
	ApiServer      string `json:"apiServerUrl"`
	UpvsLogin      string `json:"upvsLoginUrl"`
	LogoutCallback string `json:"logoutCallbackUrl"`
}

type Configuration struct {
	Port                int
	Urls                Urls
	ClientBuildDir      string
	LogLevel            log.Level
	ServerReadTimeout   time.Duration
	ServerWriteTimeout  time.Duration
	GracefulTimeout     time.Duration
}

func New() *Configuration {
	webserverEnv := environment.Getenv("WEBSERVER_ENV", "")
	var config Configuration
	switch webserverEnv {
	case "prod":
		config = prodConfig
		// Use different formatting in production, which can be easily processed by elasticsearch
		log.SetFormatter(&log.JSONFormatter{})
	case "dev":
		config = devConfig
	default:
		log.WithField("environment", webserverEnv).Fatal("config.environment.unknown")
	}

	var err error
	logLevel := environment.Getenv("LOG_LEVEL", config.LogLevel.String())
	config.LogLevel, err = log.ParseLevel(logLevel)
	if err != nil {
		log.WithField("logLevel", logLevel).Fatal("config.logLevel.unknown")
	}

	config.Port = environment.ParseInt("PORT", config.Port)
	config.ClientBuildDir = environment.Getenv("CLIENT_BUILD_DIR", config.ClientBuildDir)
	config.Urls = Urls{
		ApiServer:      environment.Getenv("API_SERVER_URL", config.Urls.ApiServer),
		UpvsLogin:      environment.Getenv("UPVS_LOGIN_URL", config.Urls.UpvsLogin),
		LogoutCallback: environment.Getenv("LOGOUT_CALLBACK_URL", config.Urls.LogoutCallback),
	}

	config.ServerReadTimeout = environment.ParseDuration("SERVER_READ_TIMEOUT", config.ServerReadTimeout)
	config.ServerWriteTimeout = environment.ParseDuration("SERVER_WRITE_TIMEOUT", config.ServerWriteTimeout)
	config.GracefulTimeout = environment.ParseDuration("GRACEFUL_TIMEOUT", config.GracefulTimeout)

	log.Info("config.loaded")
	return &config
}
