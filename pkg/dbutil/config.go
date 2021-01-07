package dbutil

import "github.com/slovak-egov/einvoice/pkg/environment"

type Configuration struct {
	Host       string
	Port       int
	Name       string
	User       string
	Password   string
	LogQueries bool
}

func NewConfig(defaultConfig Configuration) Configuration {
	return Configuration{
		Host:       environment.Getenv("DB_HOST", defaultConfig.Host),
		Port:       environment.ParseInt("DB_PORT", defaultConfig.Port),
		Name:       environment.Getenv("DB_NAME", defaultConfig.Name),
		User:       environment.Getenv("DB_USER", defaultConfig.User),
		Password:   environment.Getenv("DB_PASSWORD", defaultConfig.Password),
		LogQueries: environment.ParseBool("DB_LOG_QUERIES", defaultConfig.LogQueries),
	}
}
