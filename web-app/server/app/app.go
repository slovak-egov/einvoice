package app

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/handlerutil"
	"github.com/slovak-egov/einvoice/web-app/server/config"
)

type App struct {
	config *config.Configuration
	router *mux.Router
}

func NewApp() *App {
	a := &App{
		config: config.New(),
		router: mux.NewRouter(),
	}

	a.router.Use(handlerutil.LoggingMiddleware)

	a.router.PathPrefix("/").Handler(
		NewUiHandler(
			a.config.ClientBuildDir,
			"index.html",
			a.config.Urls,
		),
	)

	return a
}

func (a *App) Run() {
	srv := &http.Server{
		Handler:      a.router,
		Addr:         fmt.Sprintf("%s:%d", "0.0.0.0", a.config.Port),
		WriteTimeout: a.config.ServerWriteTimeout,
		ReadTimeout:  a.config.ServerReadTimeout,
	}

	log.WithField("address", srv.Addr).Info("webapp.server.start")

	go func() {
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			log.WithField("error", err.Error()).Fatal("webapp.server.failed")
		}
	}()

	handlerutil.GracefulShutdown(srv, a.config.GracefulTimeout)
}
