package webserver

import (
	"html/template"
	"net/http"
	"os"
	"path/filepath"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/webserver/config"
)

type UiHandler struct {
	StaticPath        string
	reactAppConfig    config.Urls
	staticFilesServer http.Handler
	htmlTemplate      *template.Template
}

func NewUiHandler(staticPath, indexPath string, reactAppConfig config.Urls) UiHandler {
	htmlTemplate, err := template.ParseFiles(filepath.Join(staticPath, indexPath))
	if err != nil {
		log.WithField("error", err.Error()).Fatal("uiHandler.htmlParse.failed")
	}

	return UiHandler{
		staticPath,
		reactAppConfig,
		http.FileServer(http.Dir(staticPath)),
		htmlTemplate,
	}
}

// Let client do the routing.
// If static file does not exist on requested path return file on IndexPath
func (h UiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Prepend the path with the path to the static directory
	path = filepath.Join(h.StaticPath, path)

	// Check if file exists at the given path
	_, err = os.Stat(path)
	if r.URL.Path == "/" || os.IsNotExist(err) {
		// File does not exist, serve index.html
		h.htmlTemplate.Execute(w, h.reactAppConfig)
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		h.staticFilesServer.ServeHTTP(w, r)
	}
}
