package testutil

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func ExecuteRequest(handler http.Handler, req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	return rr
}

func ExecuteAuthRequest(handler http.Handler, req *http.Request, authToken string) *httptest.ResponseRecorder {
	req.Header.Set("Authorization", "Bearer "+authToken)
	return ExecuteRequest(handler, req)
}

func ExecuteApiKeyRequest(handler http.Handler, req *http.Request, token string) *httptest.ResponseRecorder {
	req.Header.Set("X-API-Key", token)
	return ExecuteRequest(handler, req)
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func CheckError(t *testing.T, response *httptest.ResponseRecorder, expectedCode int, msg string) {
	t.Helper()

	assert.Equal(t, expectedCode, response.Code)

	if msg != "" {
		var e ErrorResponse
		err := json.Unmarshal(response.Body.Bytes(), &e)
		if err != nil {
			t.Error(err.Error())
		}

		assert.Equal(t, msg, e.Error)
	}
}
