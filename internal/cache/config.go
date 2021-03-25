package cache

import (
	"time"

	"github.com/slovak-egov/einvoice/pkg/environment"
)

type Configuration struct {
	Host                             string
	Port                             int
	Password                         string
	SessionTokenExpiration           time.Duration
	DraftExpiration                  time.Duration
	TestInvoiceRateLimiterExpiration time.Duration
	TestInvoiceRateLimiterThreshold  int
}

func NewConfig(defaultConfig Configuration) Configuration {
	return Configuration{
		Host:                   environment.Getenv("CACHE_HOST", defaultConfig.Host),
		Port:                   environment.ParseInt("CACHE_PORT", defaultConfig.Port),
		Password:               environment.Getenv("CACHE_PASSWORD", defaultConfig.Password),
		SessionTokenExpiration: environment.ParseDuration(
			"SESSION_TOKEN_EXPIRATION", defaultConfig.SessionTokenExpiration,
		),
		DraftExpiration: environment.ParseDuration("DRAFT_EXPIRATION", defaultConfig.DraftExpiration),
		TestInvoiceRateLimiterExpiration: environment.ParseDuration(
			"TEST_INVOICE_RATE_LIMITER_EXPIRATION", defaultConfig.TestInvoiceRateLimiterExpiration,
		),
		TestInvoiceRateLimiterThreshold: environment.ParseInt(
			"TEST_INVOICE_RATE_LIMITER_THRESHOLD", defaultConfig.TestInvoiceRateLimiterThreshold,
		),
	}
}

