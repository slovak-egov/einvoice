package config

import (
	"crypto/rsa"
	"log"

	"github.com/slovak-egov/einvoice/pkg/environment"
	"github.com/slovak-egov/einvoice/pkg/keys"
)

type UserConfiguration struct {
	PrivateKey *rsa.PrivateKey
	Id         int
}

type Configuration struct {
	ApiServerUrl     string
	OutputFile       string
	ExamplesPath     string
	User             UserConfiguration
	IterationsNumber int
	ThreadNumber     int
}

func New() *Configuration {
	config := Configuration{
		ApiServerUrl:     environment.Getenv("API_SERVER_URL", "https://dev.api.einvoice.mfsr.sk"),
		OutputFile:       environment.Getenv("OUTPUT_FILE", ""),
		ExamplesPath:     environment.Getenv("EXAMPLES_PATH", "./data/examples"),
		User:             UserConfiguration{
			Id: environment.ParseInt("USER_ID", 0),
		},
		IterationsNumber: environment.ParseInt("ITERATIONS_NUMBER", 1),
		ThreadNumber:     environment.ParseInt("THREAD_NUMBER", 2),
	}

	var err error
	config.User.PrivateKey, err = keys.GetPrivateKey(environment.Getenv("USER_PRIVATE_KEY", ""))
	if err != nil {
		log.Println("userPrivateKey.parse.fail", err)
		panic(err)
	}

	return &config
}
