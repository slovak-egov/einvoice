package environment

import (
	"os"
	"strconv"
	"time"

	log "github.com/sirupsen/logrus"
)

func ParseInt(varName string, defaultValue int) int {
	parsedVar, parseError := strconv.Atoi(
		Getenv(varName, strconv.Itoa(defaultValue)),
	)
	if parseError != nil {
		log.WithFields(log.Fields{
			"env": varName,
			"error": parseError,
		}).Fatal("environment.parseInt.error")
	}

	return parsedVar
}

func Getenv(varName, defaultValue string) string {
	envVar, ok := os.LookupEnv(varName)

	if !ok {
		log.WithFields(log.Fields{
			"env": varName,
			"defaultValue": defaultValue,
		}).Debug("environment.getEnv.defaultValue")
		return defaultValue
	}

	return envVar
}

func ParseDuration(varName string, defaultValue time.Duration) time.Duration {
	seconds := ParseInt(varName, -1)
	if seconds != -1 {
		return time.Duration(seconds) * time.Second
	} else {
		return defaultValue
	}
}
