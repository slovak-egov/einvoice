package app

import (
	"fmt"
	"net/http"
	"time"

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

	a.router.PathPrefix("/").Handler(
		UiHandler{
			StaticPath: a.config.ClientBuildDir,
			IndexPath: "index.html",
			reactAppConfig: a.config.Urls,
		},
	)

	return a
}

func (a *App) Run() {
	srv := &http.Server{
		Handler:      handlerutil.LoggingHandler{a.router},
		Addr:         fmt.Sprintf("%s:%d", "0.0.0.0", a.config.Port),
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.WithField("address", srv.Addr).Info("webapp.server.start")

	log.WithField("error", srv.ListenAndServe()).Fatal("webapp.server.failed")
}
