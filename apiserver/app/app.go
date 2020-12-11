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
	muxHandlers.AllowedHeaders([]string{"Content-Type", "Origin", "Accept", "X-API-Key", "Authorization"}),
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

	registerHandler(a.router, "GET", "/login", a.handleLogin)
	registerHandler(a.router, "GET", "/logout", a.handleLogout)

	apiRouter := a.router.PathPrefix("/").Subrouter()
	apiRouter.Use(a.userIdentificationMiddleware)

	invoicesRouter := apiRouter.PathPrefix("/invoices").Subrouter()
	registerHandler(invoicesRouter, "GET", "", a.getPublicInvoices)
	registerHandler(invoicesRouter, "GET", "/{id:[0-9]+}", a.getInvoice)
	registerHandler(invoicesRouter, "GET", "/{id:[0-9]+}/detail", a.getInvoiceXml)
	registerHandler(invoicesRouter, "GET", "/{id:[0-9]+}/visualization", a.getInvoiceVisualization)
	registerHandler(invoicesRouter, "POST", "", a.createInvoice)

	usersRouter := apiRouter.PathPrefix("/users/{id:[0-9]+}").Subrouter()
	usersRouter.Use(requireUserMiddleware)
	registerHandler(usersRouter, "GET", "", a.getUser)
	registerHandler(usersRouter, "PATCH", "", a.updateUser)
	registerHandler(usersRouter, "GET", "/substitutes", a.getUserSubstitutes)
	registerHandler(usersRouter, "POST", "/substitutes", a.addUserSubstitutes)
	registerHandler(usersRouter, "DELETE", "/substitutes", a.removeUserSubstitutes)
	registerHandler(usersRouter, "GET", "/invoices", a.getUserInvoices)
	registerHandler(usersRouter, "GET", "/organizations", a.getUserOrganizations)
}

func (a *App) Run() {
	srv := &http.Server{
		Handler:      muxHandlers.CORS(corsOptions...)(a.router),
		Addr:         fmt.Sprintf("%s:%d", "0.0.0.0", a.config.Port),
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

func (a *App) CloseResources() {
	a.db.Close()
}

func (a *App) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	a.router.ServeHTTP(res, req)
}
