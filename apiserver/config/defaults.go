package config

import (
	"time"

	"github.com/sirupsen/logrus"
)

var devConfig = Configuration{
	Db: DbConfiguration{
		Host: "localhost",
		Port: 5432,
		Name: "einvoice",
		User: "postgres",
	},
	Port:               8081,
	D16bXsdPath:        "xml/d16b/xsd",
	Ubl21XsdPath:       "xml/ubl21/xsd",
	LogLevel:           logrus.DebugLevel,
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
	Cache: CacheConfiguration{
		Host:                   "localhost",
		Port:                   6379,
		SessionTokenExpiration: 24 * time.Hour,
	},
	SlovenskoSk: SlovenskoSkConfiguration{
		Url:               "https://upvs.dev.filipsladek.com",
		LogoutCallbackUrl: "http://localhost:3000/logout-callback",
	},
	InvoicesLimit: 5,
	ApiKey: ApiKeyConfiguration{
		MaxExpiration: 10 * time.Minute,
		JtiExpiration: 15 * time.Minute,
	},
}

var prodConfig = Configuration{
	Db: DbConfiguration{
		Port: 5432,
		Name: "einvoice",
	},
	Port:         80,
	D16bXsdPath:  "xml/d16b/xsd",
	Ubl21XsdPath: "xml/ubl21/xsd",
	LogLevel:     logrus.InfoLevel,
	Mail: MailConfiguration{
		Email: "einvoice.dev@gmail.com",
	},
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
	Cache: CacheConfiguration{
		Port:                   6379,
		SessionTokenExpiration: 1 * time.Hour,
	},
	SlovenskoSk: SlovenskoSkConfiguration{
		Url:               "https://upvs.dev.filipsladek.com",
		LogoutCallbackUrl: "https://web-app.dev.filipsladek.com/logout-callback",
	},
	InvoicesLimit: 20,
	ApiKey: ApiKeyConfiguration{
		MaxExpiration: 10 * time.Minute,
		JtiExpiration: 15 * time.Minute,
	},
}

var testConfig = Configuration{
	Db: DbConfiguration{
		Host: "localhost",
		Port: 5432,
		Name: "test",
		User: "postgres",
	},
	D16bXsdPath:        "xml/d16b/xsd",
	Ubl21XsdPath:       "xml/ubl21/xsd",
	LogLevel:           logrus.WarnLevel,
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
	Cache: CacheConfiguration{
		Host:                   "localhost",
		Port:                   6379,
		SessionTokenExpiration: 1 * time.Hour,
	},
	InvoicesLimit: 5,
	ApiKey: ApiKeyConfiguration{
		MaxExpiration: 10 * time.Minute,
		JtiExpiration: 15 * time.Minute,
	},
}
