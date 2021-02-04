package handlerutil

import (
	"encoding/json"
	"net/http"
)

func RespondWithJSON(res http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)

	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(code)
	res.Write(response)
}

func respondWithError(res http.ResponseWriter, code int, message string, fields map[string]interface{}) {
	body := map[string]interface{}{"error": message}
	for name, value := range fields {
		body[name] = value
	}
	RespondWithJSON(res, code, body)
}

func ErrorRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				respondWithError(res, http.StatusInternalServerError, "Something went wrong", nil)
			}
		}()
		next.ServeHTTP(res, req)
	})
}
