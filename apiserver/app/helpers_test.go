package app

import (
	"context"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/slovak-egov/einvoice/apiserver/entity"
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

func checkResponseCode(t *testing.T, expected, actual int) {
	t.Helper()
	if expected != actual {
		t.Errorf("Expected response code %d. Got %d\n", expected, actual)
	}
}

func createTestInvoice(t *testing.T, test bool) int {
	t.Helper()
	user, _ := createTestUser(t)
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
	}

	if err := a.db.CreateInvoice(ctx, invoice); err != nil {
		t.Fatal(err)
	}

	return invoice.Id
}

func createTestUser(t *testing.T) (*entity.User, string) {
	t.Helper()

	user, err := a.db.GetOrCreateUser(ctx, "ico://sk/11190993", "Frantisek")
	if err != nil {
		t.Error(err)
	}

	sessionToken := "123"
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
