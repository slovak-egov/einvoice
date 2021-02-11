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

func respondWithError(res http.ResponseWriter, code int, message, detail string) {
	body := map[string]interface{}{"error": message}
	if detail != "" {
		body["detail"] = detail
	}
	RespondWithJSON(res, code, body)
}

func ErrorRecovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				respondWithError(res, http.StatusInternalServerError, "Something went wrong","")
			}
		}()
		next.ServeHTTP(res, req)
	})
}
