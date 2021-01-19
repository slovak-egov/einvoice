package entity

import (
	"errors"
	"strings"
	"time"
)

func IcoToUri(ico string) string {
	return "ico://sk/" + ico
}

func IcosToUris(icos []string) []string {
	uris := []string{}
	for _, ico := range icos {
		uris = append(uris, IcoToUri(ico))
	}
	return uris
}

func UriToIco(uri string) (string, error) {
	if !strings.HasPrefix(uri, "ico://sk/") {
		return "", errors.New("not valid ico uri")
	} else {
		return uri[9:], nil
	}
}

type User struct {
	Id                      int       `json:"id"`
	CreatedAt               time.Time `json:"createdAt"`
	UpvsUri                 string    `json:"upvsUri"`
	Name                    string    `json:"name"`
	ServiceAccountPublicKey *string   `json:"serviceAccountPublicKey"`
}
