package config

import (
	"time"

	"github.com/sirupsen/logrus"
)

var devConfig = Configuration{
	Port: 8080,
	Urls: Urls{
		ApiServer: "http://localhost:8081",
		SlovenskoSkLogin: "https://upvs.dev.filipsladek.com/login?callback=http://localhost:3000/login-callback",
	},
	ClientBuildDir:     "web-app/client/build",
	LogLevel:           logrus.DebugLevel,
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
}

var prodConfig = Configuration{
	Port: 80,
	Urls: Urls{
		SlovenskoSkLogin: "https://upvs.dev.filipsladek.com/login?callback=https://dev.einvoice.mfsr.sk/login-callback",
	},
	ClientBuildDir:     "/client/build",
	LogLevel:           logrus.InfoLevel,
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
}
