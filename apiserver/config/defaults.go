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
	Cache: CacheConfiguration{
		Host:                   "localhost",
		Port:                   6379,
		SessionTokenExpiration: 24 * time.Hour,
	},
	SlovenskoSk: SlovenskoSkConfiguration{
		Url: "https://upvs.dev.filipsladek.com",
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
	Cache: CacheConfiguration{
		Port:                   6379,
		SessionTokenExpiration: 1 * time.Hour,
	},
	SlovenskoSk: SlovenskoSkConfiguration{
		Url: "https://upvs.dev.filipsladek.com",
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
	LogLevel:           logrus.InfoLevel,
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	Cache: CacheConfiguration{
		Host:                   "localhost",
		Port:                   6379,
		SessionTokenExpiration: 1 * time.Hour,
	},
}
