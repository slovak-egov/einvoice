package migration

import (
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/environment"
)

type Configuration struct {
	DbHost     string
	DbPort     int
	DbName     string
	DbUser     string
	DbPassword string
}

func NewConfig() Configuration {
	config := Configuration{
		DbHost:     environment.Getenv("DB_HOST", "localhost"),
		DbPort:     environment.ParseInt("DB_PORT", 5432),
		DbName:     environment.Getenv("DB_NAME", "einvoice"),
		DbUser:     environment.Getenv("DB_USER", "postgres"),
		DbPassword: environment.Getenv("DB_PASSWORD", ""),
	}

	log.Info("config.loaded")

	return config
}

