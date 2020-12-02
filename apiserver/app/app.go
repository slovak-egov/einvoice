package app

import (
	"fmt"
	"net/http"

	muxHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/apiserver/cache"
	"github.com/slovak-egov/einvoice/apiserver/config"
	"github.com/slovak-egov/einvoice/apiserver/db"
	"github.com/slovak-egov/einvoice/apiserver/mail"
	"github.com/slovak-egov/einvoice/apiserver/slovenskoSk"
	"github.com/slovak-egov/einvoice/apiserver/storage"
	"github.com/slovak-egov/einvoice/apiserver/xml"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

var corsOptions = []muxHandlers.CORSOption{
	muxHandlers.AllowedHeaders([]string{"Content-Type", "Origin", "Accept", "token", "Authorization"}),
	muxHandlers.AllowedOrigins([]string{"*"}),
	muxHandlers.AllowedMethods([]string{"GET", "POST", "OPTIONS", "DELETE", "PUT", "PATCH"}),
}

type App struct {
	config      *config.Configuration
	router      *mux.Router
	db          *db.Connector
	storage     *storage.LocalStorage
	validator   xml.Validator
	cache       *cache.Cache
	slovenskoSk *slovenskoSk.Connector
	mail        *mail.Sender
}

func NewApp() *App {
	appConfig := config.New()

	a := &App{
		config:      appConfig,
		router:      mux.NewRouter(),
		db:          db.NewConnector(appConfig.Db),
		storage:     storage.New(appConfig.LocalStorageBasePath),
		validator:   xml.NewValidator(appConfig),
		cache:       cache.NewRedis(appConfig.Cache),
		slovenskoSk: slovenskoSk.New(appConfig.SlovenskoSk),
		mail:        mail.NewSender(appConfig.Mail),
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
	authRouter := a.router.PathPrefix("/").Subrouter()
	authRouter.Use(a.authMiddleware)

	registerHandler(a.router, "GET", "/invoices",  a.getInvoices)
	registerHandler(a.router, "GET", "/invoices/{id:[0-9]+}",  a.getInvoice)
	registerHandler(a.router, "GET", "/invoices/{id:[0-9]+}/detail",  a.getInvoiceDetail)
	registerHandler(authRouter, "POST", "/invoices",  a.createInvoice)

	registerHandler(a.router, "GET", "/login",  a.handleLogin)
	registerHandler(a.router, "GET", "/logout",  a.handleLogout)
	registerHandler(authRouter, "GET", "/users/{id:[0-9]+}",  a.getUser)
	registerHandler(authRouter, "PATCH", "/users/{id:[0-9]+}",  a.updateUser)
	registerHandler(authRouter, "GET", "/users/{id:[0-9]+}/substitutes",  a.getUserSubstitutes)
	registerHandler(authRouter, "POST", "/users/{id:[0-9]+}/substitutes",  a.addUserSubstitutes)
	registerHandler(authRouter, "DELETE", "/users/{id:[0-9]+}/substitutes",  a.removeUserSubstitutes)
	registerHandler(authRouter, "GET", "/users/{id:[0-9]+}/invoices",  a.getUserInvoices)
}

func (a *App) Run() {
	srv := &http.Server{
		Handler:      muxHandlers.CORS(corsOptions...)(a.router),
		Addr:         fmt.Sprintf("%s:%d", "0.0.0.0", a.config.Port),
		WriteTimeout: a.config.ServerWriteTimeout,
		ReadTimeout:  a.config.ServerReadTimeout,
	}

	log.WithField("address", srv.Addr).Info("app.server.started")

	log.WithField("error", srv.ListenAndServe()).Fatal("app.server.failed")
}

func (a *App) Close() {
	// TODO: https://github.com/gorilla/mux#graceful-shutdown
	a.db.Close()
}

func (a *App) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	a.router.ServeHTTP(w, req)
}
