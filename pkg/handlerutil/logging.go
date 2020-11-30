package handlerutil

import (
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/context"
)

// Save response data for logging
type responseRecorder struct {
	http.ResponseWriter
	status int
}

func (r *responseRecorder) Write(p []byte) (int, error) {
	return r.ResponseWriter.Write(p)
}

// WriteHeader overrides ResponseWriter.WriteHeader to keep track of the response code
func (r *responseRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		recorder := &responseRecorder{
			ResponseWriter: res,
			status:         http.StatusOK,
		}

		startTime := time.Now()
		next.ServeHTTP(recorder, req)

		level := log.InfoLevel
		if recorder.status >= 500 {
			level = log.ErrorLevel
		} else if recorder.status >= 400 {
			level = log.WarnLevel
		}

		context.GetLogger(req.Context()).WithFields(
			log.Fields{
				"requestDuration": time.Since(startTime).String(),
				"host": req.Host,
				"method": req.Method,
				"url": req.URL.RequestURI(),
				"remoteAddress": req.RemoteAddr,
				"status": recorder.status,
			},
		).Log(level, "handler.request.finished")
	})
}

func RequestIdMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		req = req.WithContext(context.AddRequestId(req.Context()))
		next.ServeHTTP(res, req)
	})
}
