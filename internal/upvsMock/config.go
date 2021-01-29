package upvsMock

import (
	"time"

	"github.com/slovak-egov/einvoice/pkg/environment"
)

type Configuration struct {
	Host               string
	Port               int
	ServerReadTimeout  time.Duration
	ServerWriteTimeout time.Duration
	GracefulTimeout    time.Duration
	OboTokenPrivateKey string
	OboTokenPublicKey  string
	ApiTokenPublicKey  string
}

func New() *Configuration {
	var config = Configuration{}

	config.Host = environment.Getenv("HOST", "0.0.0.0")
	config.Port = environment.ParseInt("PORT", 8083)

	config.ServerReadTimeout = environment.ParseDuration("SERVER_READ_TIMEOUT", 15*time.Second)
	config.ServerWriteTimeout = environment.ParseDuration("SERVER_WRITE_TIMEOUT", 15*time.Second)
	config.GracefulTimeout = environment.ParseDuration("GRACEFUL_TIMEOUT", 10*time.Second)

	config.OboTokenPrivateKey = environment.Getenv("OBO_TOKEN_PRIVATE", "")
	config.OboTokenPublicKey = environment.Getenv("OBO_TOKEN_PUBLIC", "")
	config.ApiTokenPublicKey = environment.Getenv("API_TOKEN_PUBLIC", "")

	return &config
}
