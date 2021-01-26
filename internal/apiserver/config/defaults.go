package config

import (
	"time"

	"github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/cache"
	"github.com/slovak-egov/einvoice/internal/upvs"
	"github.com/slovak-egov/einvoice/pkg/dbutil"
	"github.com/slovak-egov/einvoice/pkg/loggerutil"
)

var devConfig = Configuration{
	Db: dbutil.Configuration{
		Host: "localhost",
		Port: 5432,
		Name: "einvoice",
		User: "postgres",
	},
	Host:         "0.0.0.0",
	Port:         8081,
	D16bXsdPath:  "xml/d16b/xsd",
	Ubl21XsdPath: "xml/ubl21/xsd",
	Logger: loggerutil.Configuration{
		LogLevel: logrus.DebugLevel,
		Format:   "text",
	},
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
	Cache: cache.Configuration{
		Host:                             "localhost",
		Port:                             6379,
		SessionTokenExpiration:           24 * time.Hour,
		TestInvoiceRateLimiterExpiration: 24 * time.Hour,
		TestInvoiceRateLimiterThreshold:  20,
	},
	Upvs: upvs.Configuration{
		Url:               "https://dev.upvs.einvoice.mfsr.sk",
		LogoutCallbackUrl: "http://localhost:3000/logout-callback",
	},
	InvoicesLimit: 5,
	ApiKey: ApiKeyConfiguration{
		MaxExpiration: 10 * time.Minute,
		JtiExpiration: 15 * time.Minute,
	},
}

var prodConfig = Configuration{
	Db: dbutil.Configuration{
		Port: 5432,
		Name: "einvoice",
	},
	Host:         "0.0.0.0",
	Port:         80,
	D16bXsdPath:  "xml/d16b/xsd",
	Ubl21XsdPath: "xml/ubl21/xsd",
	Logger: loggerutil.Configuration{
		LogLevel:     logrus.InfoLevel,
		ElasticIndex: "apiserver",
		Format:       "json",
	},
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
	Cache: cache.Configuration{
		Port:                             6379,
		SessionTokenExpiration:           1 * time.Hour,
		TestInvoiceRateLimiterExpiration: 24 * time.Hour,
		TestInvoiceRateLimiterThreshold:  20,
	},
	Upvs: upvs.Configuration{
		Url:               "https://dev.upvs.einvoice.mfsr.sk",
		LogoutCallbackUrl: "https://dev.einvoice.mfsr.sk/logout-callback",
	},
	InvoicesLimit: 20,
	ApiKey: ApiKeyConfiguration{
		MaxExpiration: 10 * time.Minute,
		JtiExpiration: 15 * time.Minute,
	},
	LocalStorageBasePath: "/data",
}

var testConfig = Configuration{
	Db: dbutil.Configuration{
		Host: "localhost",
		Port: 5432,
		Name: "test",
		User: "postgres",
	},
	D16bXsdPath:  "../../xml/d16b/xsd",
	Ubl21XsdPath: "../../xml/ubl21/xsd",
	Logger: loggerutil.Configuration{
		LogLevel: logrus.ErrorLevel,
		Format:   "text",
	},
	ServerReadTimeout:  15 * time.Second,
	ServerWriteTimeout: 15 * time.Second,
	GracefulTimeout:    10 * time.Second,
	Cache: cache.Configuration{
		Host:                             "localhost",
		Port:                             6379,
		SessionTokenExpiration:           1 * time.Hour,
		TestInvoiceRateLimiterExpiration: 24 * time.Hour,
		TestInvoiceRateLimiterThreshold:  1,
	},
	InvoicesLimit: 5,
	ApiKey: ApiKeyConfiguration{
		MaxExpiration: 10 * time.Minute,
		JtiExpiration: 15 * time.Minute,
	},
}
