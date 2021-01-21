package app

import (
	"crypto/rsa"
	"fmt"
	"net/http"

	muxHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/handlerutil"
	"github.com/slovak-egov/einvoice/upvsDev/config"
)

var corsOptions = []muxHandlers.CORSOption{
	muxHandlers.AllowedHeaders([]string{"Content-Type", "Origin", "Accept", "X-API-Key", "Authorization"}),
	muxHandlers.AllowedOrigins([]string{"*"}),
	muxHandlers.AllowedMethods([]string{"GET", "POST", "OPTIONS", "DELETE", "PUT", "PATCH"}),
}

type App struct {
	config          *config.Configuration
	router          *mux.Router
	OboTokenPrivate *rsa.PrivateKey
	OboTokenPublic  *rsa.PublicKey
	ApiTokenPublic  *rsa.PublicKey
}

func NewApp() *App {
	appConfig := config.New()

	a := &App{
		config:          appConfig,
		router:          mux.NewRouter(),
		OboTokenPrivate: getPrivateKey(appConfig.OboTokenPrivateKey),
		OboTokenPublic:  getPublicKey(appConfig.OboTokenPublicKey),
		ApiTokenPublic:  getPublicKey(appConfig.ApiTokenPublicKey),
	}

	a.initializeHandlers()

	return a
}

func registerHandler(router *mux.Router, method, path string, handler func(http.ResponseWriter, *http.Request) error) {
	router.HandleFunc(path, handlerutil.ErrorHandler(handler)).Methods(method)
}

func (a *App) initializeHandlers() {
	a.router.Use(handlerutil.RequestIdMiddleware)
	a.router.Use(handlerutil.LoggingMiddleware)
	a.router.Use(handlerutil.ErrorRecovery)

	registerHandler(a.router, "GET", "/login", a.handleLogin)
	registerHandler(a.router, "GET", "/logout", a.handleLogout)
	registerHandler(a.router, "GET", "/api/upvs/user/info", a.handleUserInfo)
}

func (a *App) Run() {
	srv := &http.Server{
		Handler:      muxHandlers.CORS(corsOptions...)(a.router),
		Addr:         fmt.Sprintf("%s:%d", a.config.Host, a.config.Port),
		WriteTimeout: a.config.ServerWriteTimeout,
		ReadTimeout:  a.config.ServerReadTimeout,
	}

	log.WithField("address", srv.Addr).Info("app.server.started")

	go func() {
		if err := srv.ListenAndServe(); err != http.ErrServerClosed {
			log.WithField("error", err.Error()).Fatal("app.server.failed")
		}
	}()

	handlerutil.GracefulShutdown(srv, a.config.GracefulTimeout)
}
