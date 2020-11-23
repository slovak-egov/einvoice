package handlerutil

import (
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"
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

type LoggingHandler struct {
	Handler   http.Handler
}

func (h LoggingHandler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	// TODO: add requestId to every request to easily pair logs
	recorder := &responseRecorder{
		ResponseWriter: w,
		status:         http.StatusOK,
	}

	startTime := time.Now()
	h.Handler.ServeHTTP(recorder, req)

	level := log.InfoLevel
	if recorder.status >= 500 {
		level = log.ErrorLevel
	} else if recorder.status >= 400 {
		level = log.WarnLevel
	}

	log.WithFields(log.Fields{
		"requestDuration": time.Since(startTime).String(),
		"host": req.Host,
		"method": req.Method,
		"url": req.URL.RequestURI(),
		"remoteAddress": req.RemoteAddr,
		"status": recorder.status,
	}).Log(level, "handler.request.finished")
}

