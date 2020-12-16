package handlerutil

import (
	goContext "context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	log "github.com/sirupsen/logrus"
)

// GracefulShutdown shuts down the given HTTP server gracefully when receiving
// an os.Interrupt or syscall.SIGTERM signal.
// It will wait for the specified timeout to stop hanging HTTP handlers.
func GracefulShutdown(srv *http.Server, timeout time.Duration) {
	c := make(chan os.Signal, 1)

	// We'll accept graceful shutdowns when quit via SIGINT (Ctrl+C) or SIGTERM
	// SIGKILL or SIGQUIT will not be caught.
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	// Block until we receive our signal.
	<-c

	// Create a deadline to wait for.
	ctx, cancel := goContext.WithTimeout(goContext.Background(), timeout)
	defer cancel()

	log.WithField("timeout", timeout).Info("app.server.shutdown.started")

	// Doesn't block if no connections, but will otherwise wait
	// until the timeout deadline.
	if err := srv.Shutdown(ctx); err != nil {
		log.WithField("error", err.Error()).Error("app.server.shutdown.failed")
	} else {
		log.Info("app.server.shutdown.finished")
	}
}
