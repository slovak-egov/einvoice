package app

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

var ctx = context.Background()

func executeRequest(req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	a.ServeHTTP(rr, req)

	return rr
}

func executeAuthRequest(req *http.Request, authToken string) *httptest.ResponseRecorder {
	req.Header.Set("Authorization", "Bearer "+authToken)
	return executeRequest(req)
}

func executeApiKeyRequest(req *http.Request, token string) *httptest.ResponseRecorder {
	req.Header.Set("X-API-Key", token)
	return executeRequest(req)
}

func checkResponseCode(t *testing.T, expected, actual int) {
	t.Helper()
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}

func createTestInvoice(t *testing.T, test, isPublic bool) int {
	t.Helper()
	user, _ := createTestUser(t, "")
	invoice := &entity.Invoice{
		Sender:      "sender",
		Receiver:    "receiver",
		Format:      entity.UblFormat,
		Price:       1,
		CustomerIco: "11111111",
		SupplierIco: "22222222",
		CreatedBy:   user.Id,
		IssueDate:   timeutil.Date{time.Date(2011, 9, 22, 0, 0, 0, 0, time.UTC)},
		Test:        test,
		IsPublic:    isPublic,
	}

	if err := a.db.CreateInvoice(ctx, invoice); err != nil {
		t.Fatal(err)
	}

	return invoice.Id
}

func createTestUser(t *testing.T, ico string) (*entity.User, string) {
	t.Helper()

	if ico == "" {
		ico = "11190993"
	}
	user, err := a.db.GetOrCreateUser(ctx, "ico://sk/"+ico, "Frantisek")
	if err != nil {
		t.Error(err)
	}

	sessionToken := uuid.New().String()
	err = a.cache.SaveUserToken(ctx, sessionToken, user.Id)
	if err != nil {
		t.Error(err)
	}

	return user, sessionToken
}

func cleanDb(t *testing.T) func() {
	return func() {
		if _, err := a.db.GetDb(ctx).Model(&entity.Invoice{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}

		if _, err := a.db.GetDb(ctx).Model(&entity.Substitute{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}

		if _, err := a.db.GetDb(ctx).Model(&entity.User{}).Where("TRUE").Delete(); err != nil {
			t.Error(err)
		}
	}
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func checkError(t *testing.T, response *httptest.ResponseRecorder, expectedCode int, msg string) {
	t.Helper()

	if expectedCode != response.Code {
		t.Errorf("Expected response code %d. Got %d\n", expectedCode, response.Code)
	}

	if msg != "" {
		var e ErrorResponse
		err := json.Unmarshal(response.Body.Bytes(), &e)
		if err != nil {
			t.Error(err.Error())
		}

		if e.Error != msg {
			assert.Equal(t, msg, e.Error)
		}
	}
}
