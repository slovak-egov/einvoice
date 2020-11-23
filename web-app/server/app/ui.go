package app

import (
	"html/template"
	"net/http"
	"os"
	"path/filepath"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/web-app/server/config"
)

type UiHandler struct {
	StaticPath     string
	IndexPath      string
	reactAppConfig config.Urls
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
	if path == h.StaticPath || os.IsNotExist(err) {
		// File does not exist, serve index.html
		t, err := template.ParseFiles(filepath.Join(h.StaticPath, h.IndexPath))
		if err != nil {
			log.WithField("error", err.Error()).Error("uiHandler.htmlParse.failed")
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		t.Execute(w, h.reactAppConfig)
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		http.FileServer(http.Dir(h.StaticPath)).ServeHTTP(w, r)
	}
}
