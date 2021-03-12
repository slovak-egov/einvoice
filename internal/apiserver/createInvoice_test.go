package apiserver

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"reflect"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/testutil"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func TestCreateInvoice(t *testing.T) {
	t.Cleanup(testutil.CleanDb(ctx, t, a.db.Connector))
	t.Cleanup(testutil.CleanCache(ctx, t, a.cache))

	user := testutil.CreateUser(ctx, t, a.db.Connector, "")
	sessionToken := testutil.CreateToken(ctx, t, a.cache, user)

	var requestBody bytes.Buffer

	invoice, err := os.ReadFile("../../data/examples/ubl2.1/invoice.xml")
	if err != nil {
		t.Error(err)
	}
	if _, err = requestBody.Write(invoice); err != nil {
		t.Error(err)
	}

	req, err := http.NewRequest("POST", "/invoices", &requestBody)
	if err != nil {
		t.Error(err)
	}
	req.Header.Set("Content-Type", "application/xml")

	response := testutil.ExecuteAuthRequest(a, req, sessionToken)
	assert.Equal(t, http.StatusCreated, response.Code)

	var createdResponse entity.Invoice
	if err = json.Unmarshal(response.Body.Bytes(), &createdResponse); err != nil {
		t.Error(err)
	}
	expectedResponse := entity.Invoice{
		Id:                  createdResponse.Id,        // No need to assert this param,
		CreatedAt:           createdResponse.CreatedAt, // No need to assert this param
		Sender:              "Global Trade Chain",
		Receiver:            "Project Services",
		Amount:              12500,
		AmountWithoutVat:    10000,
		SupplierIco:         "11190993",
		CustomerIco:         "22222222",
		Format:              entity.UblFormat,
		CreatedBy:           user.Id,
		IssueDate:           timeutil.Date{time.Date(2011, 9, 22, 0, 0, 0, 0, time.UTC)},
		NotificationsStatus: entity.NotificationStatusNotSent,
	}
	if !reflect.DeepEqual(createdResponse, expectedResponse) {
		t.Errorf("Expected created response was %v. Got %v", expectedResponse, createdResponse)
	}

	// Try to get invoice metadata through API
	req, err = http.NewRequest("GET", fmt.Sprintf("/invoices/%d", createdResponse.Id), nil)
	if err != nil {
		t.Error(err)
	}
	response = testutil.ExecuteRequest(a, req)

	assert.Equal(t, http.StatusOK, response.Code)
	var getResponse entity.Invoice
	if err = json.Unmarshal(response.Body.Bytes(), &getResponse); err != nil {
		t.Error(err)
	}
	if !reflect.DeepEqual(createdResponse, getResponse) {
		t.Errorf("Created response was %v. While GET request returned %v", createdResponse, getResponse)
	}

	// Try to get actual invoice through API
	req, err = http.NewRequest("GET", fmt.Sprintf("/invoices/%d/detail", createdResponse.Id), nil)
	if err != nil {
		t.Error(err)
	}
	response = testutil.ExecuteRequest(a, req)

	assert.Equal(t, http.StatusOK, response.Code)
	assert.Equal(t, invoice, response.Body.Bytes())
}

func TestRateLimiter(t *testing.T) {
	t.Cleanup(testutil.CleanDb(ctx, t, a.db.Connector))
	t.Cleanup(testutil.CleanCache(ctx, t, a.cache))

	user := testutil.CreateUser(ctx, t, a.db.Connector, "")
	sessionToken := testutil.CreateToken(ctx, t, a.cache, user)

	var requestBody bytes.Buffer

	invoice, err := os.ReadFile("../../data/examples/ubl2.1/invoice.xml")
	if err != nil {
		t.Error(err)
	}
	if _, err = requestBody.Write(invoice); err != nil {
		t.Error(err)
	}
	body := requestBody.Bytes()

	req, err := http.NewRequest("POST", "/invoices/test", bytes.NewReader(body))
	if err != nil {
		t.Error(err)
	}
	req.Header.Set("Content-Type", "application/xml")

	response := testutil.ExecuteAuthRequest(a, req, sessionToken)
	assert.Equal(t, http.StatusCreated, response.Code)

	// Limit for creating test invoices was reached, creating another test invoice should be rejected
	req, err = http.NewRequest("POST", "/invoices/test", bytes.NewReader(body))
	if err != nil {
		t.Error(err)
	}
	req.Header.Set("Content-Type", "application/xml")

	response = testutil.ExecuteAuthRequest(a, req, sessionToken)
	assert.Equal(t, http.StatusTooManyRequests, response.Code)
}
