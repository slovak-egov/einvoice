package upvs

import "github.com/slovak-egov/einvoice/pkg/environment"

type Configuration struct {
	Url                string
	ApiTokenPrivateKey string
	OboTokenPublicKey  string
}

func NewConfig(defaultConfig Configuration) Configuration {
	return Configuration{
		Url:                environment.Getenv("UPVS_URL", defaultConfig.Url),
		ApiTokenPrivateKey: environment.Getenv("API_TOKEN_PRIVATE", defaultConfig.ApiTokenPrivateKey),
		OboTokenPublicKey:  environment.Getenv("OBO_TOKEN_PUBLIC", defaultConfig.OboTokenPublicKey),
	}
}
