package context

import (
	"context"

	log "github.com/sirupsen/logrus"
)

func GetRequestLogger(requestId string) log.FieldLogger {
	if requestId == "" {
		return log.StandardLogger()
	}
	return log.StandardLogger().WithField(requestIdKey, requestId)
}

func GetLogger(ctx context.Context) log.FieldLogger {
	return GetRequestLogger(GetRequestId(ctx))
}
