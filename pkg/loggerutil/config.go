package loggerutil

import (
	"github.com/elastic/go-elasticsearch/v7"
	log "github.com/sirupsen/logrus"
	"gopkg.in/go-extras/elogrus.v7"

	"github.com/slovak-egov/einvoice/pkg/environment"
)

type Configuration struct {
	LogLevel              log.Level
	ElasticsearchUrl      string
	ElasticsearchUser     string
	ElasticsearchPassword string
	ElasticIndex          string
	Format                string
}

func NewConfig(defaultConfig Configuration) Configuration {
	config := Configuration{
		ElasticsearchUrl:      environment.Getenv("LOGGER_ELASTICSEARCH_URL", defaultConfig.ElasticsearchUrl),
		ElasticIndex:          environment.Getenv("LOGGER_ELASTICSEARCH_INDEX", defaultConfig.ElasticIndex),
		Format:                environment.Getenv("LOGGER_FORMAT", defaultConfig.Format),
		ElasticsearchUser:     environment.Getenv("LOGGER_ELASTICSEARCH_USER", defaultConfig.ElasticsearchUser),
		ElasticsearchPassword: environment.Getenv("LOGGER_ELASTICSEARCH_PASSWORD", defaultConfig.ElasticsearchPassword),
	}

	// Set level
	var err error
	logLevel := environment.Getenv("LOG_LEVEL", defaultConfig.LogLevel.String())
	config.LogLevel, err = log.ParseLevel(logLevel)
	if err != nil {
		log.WithField("logLevel", logLevel).Fatal("config.logger.logLevel.unknown")
	}
	log.SetLevel(config.LogLevel)

	// Set format
	switch config.Format {
	case "json":
		log.SetFormatter(&log.JSONFormatter{})
	case "text":
		log.SetFormatter(&log.TextFormatter{})
	default:
		log.WithField("format", config.Format).Fatal("config.logger.format.unknown")
	}

	return config
}

// Asynchronously send logs to elasticsearch
// In future we can replace this with filebeat
func (c *Configuration) ConnectElastic() {
	// If elasticsearch url is not configured
	// skip sending logs to elastic
	if c.ElasticsearchUrl == "" {
		return
	}

	client, err := elasticsearch.NewClient(elasticsearch.Config{
		Addresses: []string{c.ElasticsearchUrl},
		Username:  c.ElasticsearchUser,
		Password:  c.ElasticsearchPassword,
	})
	if err != nil {
		log.WithField("error", err.Error()).Fatal("server.logger.elasticClientCreation.failed")
	}
	hook, err := elogrus.NewAsyncElasticHook(
		client, "0.0.0.0", c.LogLevel, c.ElasticIndex,
	)
	if err != nil {
		log.WithField("error", err.Error()).Fatal("server.logger.elasticHookCreation.failed")
	}
	log.AddHook(hook)
}
