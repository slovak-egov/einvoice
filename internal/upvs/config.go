package upvs

import "github.com/slovak-egov/einvoice/pkg/environment"

type Configuration struct {
	Url                string
	ApiTokenPrivateKey string
	OboTokenPublicKey  string
	// Identifier of certificate used for communication trough UPVS SSO. Required for sending notifications.
	SsoSubject string
}

func NewConfig(defaultConfig Configuration) Configuration {
	return Configuration{
		Url:                environment.Getenv("UPVS_URL", defaultConfig.Url),
		ApiTokenPrivateKey: environment.Getenv("API_TOKEN_PRIVATE", defaultConfig.ApiTokenPrivateKey),
		OboTokenPublicKey:  environment.Getenv("OBO_TOKEN_PUBLIC", defaultConfig.OboTokenPublicKey),
		SsoSubject:         environment.Getenv("SSO_SUBJECT", defaultConfig.SsoSubject),
	}
}
