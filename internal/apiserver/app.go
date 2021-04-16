package apiserver

import (
	"fmt"
	"net/http"

	muxHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/apiserver/config"
	"github.com/slovak-egov/einvoice/internal/apiserver/rulesValidator"
	"github.com/slovak-egov/einvoice/internal/apiserver/xsdValidator"
	"github.com/slovak-egov/einvoice/internal/cache"
	"github.com/slovak-egov/einvoice/internal/db"
	"github.com/slovak-egov/einvoice/internal/storage"
	"github.com/slovak-egov/einvoice/internal/upvs"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
)

var corsOptions = []muxHandlers.CORSOption{
	muxHandlers.AllowedHeaders([]string{"Content-Type", "Origin", "Accept", "X-API-Key", "Authorization"}),
	muxHandlers.AllowedOrigins([]string{"*"}),
	muxHandlers.AllowedMethods([]string{"GET", "POST", "OPTIONS", "DELETE", "PUT", "PATCH"}),
}

type App struct {
	config         *config.Configuration
	router         *mux.Router
	db             *db.Connector
	storage        *storage.LocalStorage
	xsdValidator   *xsdValidator.XsdValidator
	cache          *cache.Cache
	upvs           *upvs.Connector
	rulesValidator rulesValidator.Validator
}

func NewApp() *App {
	appConfig := config.New()

	a := &App{
		config:         appConfig,
		router:         mux.NewRouter(),
		db:             db.NewConnector(appConfig.Db),
		storage:        storage.New(appConfig.LocalStorageBasePath),
		xsdValidator:   xsdValidator.New(appConfig.Ubl21XsdPath, appConfig.D16bXsdPath),
		cache:          cache.NewRedis(appConfig.Cache),
		upvs:           upvs.New(appConfig.Upvs),
		rulesValidator: rulesValidator.New(appConfig.ValidationServerUrl),
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

	// Share static data files
	a.router.PathPrefix("/data").Methods("GET").Handler(
		http.StripPrefix("/data/", http.FileServer(http.Dir(a.config.DataPath))),
	)

	registerHandler(a.router, "GET", "/login", a.handleLogin)
	registerHandler(a.router, "GET", "/logout", a.handleLogout)
	registerHandler(a.router, "GET", "/upvs/logout", a.handleUpvsLogout)
	registerHandler(a.router, "POST", "/invoices/visualization", a.createVisualization)

	apiRouter := a.router.PathPrefix("/").Subrouter()
	apiRouter.Use(a.userIdentificationMiddleware)

	invoicesRouter := apiRouter.PathPrefix("/invoices").Subrouter()
	registerHandler(invoicesRouter, "GET", "", a.getPublicInvoices)
	registerHandler(invoicesRouter, "GET", "/{id}", a.getInvoice)
	registerHandler(invoicesRouter, "GET", "/{id}/detail", a.getInvoiceXml)
	registerHandler(invoicesRouter, "GET", "/{id}/visualization", a.getInvoiceVisualization)
	registerHandler(invoicesRouter, "POST", "", a.createInvoice(false))
	registerHandler(invoicesRouter, "POST", "/test", a.createInvoice(true))

	usersRouter := apiRouter.PathPrefix("/users/{id:[0-9]+}").Subrouter()
	usersRouter.Use(requireUserMiddleware)
	registerHandler(usersRouter, "GET", "", a.getUser)
	registerHandler(usersRouter, "PATCH", "", a.updateUser)
	registerHandler(usersRouter, "GET", "/substitutes", a.getUserSubstitutes)
	registerHandler(usersRouter, "POST", "/substitutes", a.addUserSubstitutes)
	registerHandler(usersRouter, "DELETE", "/substitutes", a.removeUserSubstitutes)
	registerHandler(usersRouter, "GET", "/invoices", a.getUserInvoices)
	registerHandler(usersRouter, "GET", "/organizations", a.getUserOrganizations)

	draftsRouter := apiRouter.PathPrefix("/drafts").Subrouter()
	draftsRouter.Use(requireUserMiddleware)
	registerHandler(draftsRouter, "GET", "", a.getMyDrafts)
	registerHandler(draftsRouter, "POST", "", a.createMyDraft)
	registerHandler(draftsRouter, "GET", "/{id}", a.getMyDraft)
	registerHandler(draftsRouter, "PATCH", "/{id}", a.updateMyDraft)
	registerHandler(draftsRouter, "DELETE", "/{id}", a.deleteMyDraft)
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

func (a *App) CloseResources() {
	a.db.Close()
}

func (a *App) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	a.router.ServeHTTP(res, req)
}
