package apiserver

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"reflect"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func TestCreateInvoice(t *testing.T) {
	t.Cleanup(cleanDb(t))
	user, sessionToken := createTestUser(t, "")

	var requestBody bytes.Buffer
	multipartWriter := multipart.NewWriter(&requestBody)
	if err := multipartWriter.WriteField("format", entity.UblFormat); err != nil {
		t.Error(err)
	}

	invoiceWriter, err := multipartWriter.CreateFormFile("invoice", "invoice.xml")
	if err != nil {
		t.Error(err)
	}
	invoice, err := ioutil.ReadFile("../../data/examples/ubl2.1/invoice.xml")
	if err != nil {
		t.Error(err)
	}
	if _, err = invoiceWriter.Write(invoice); err != nil {
		t.Error(err)
	}
	if err = multipartWriter.Close(); err != nil {
		t.Error(err)
	}

	req, err := http.NewRequest("POST", "/invoices", &requestBody)
	if err != nil {
		t.Error(err)
	}
	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	response := executeAuthRequest(req, sessionToken)
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
		Price:               12500,
		SupplierIco:         "11190993",
		CustomerIco:         "22222222",
		Format:              entity.UblFormat,
		CreatedBy:           user.Id,
		IssueDate:           timeutil.Date{time.Date(2011, 9, 22, 0, 0, 0, 0, time.UTC)},
		IsPublic:            true,
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
	response = executeRequest(req)

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
	response = executeRequest(req)

	assert.Equal(t, http.StatusOK, response.Code)
	assert.Equal(t, invoice, response.Body.Bytes())
}

func TestRateLimiter(t *testing.T) {
	t.Cleanup(cleanDb(t))
	t.Cleanup(cleanCache(t))
	_, sessionToken := createTestUser(t, "")

	var requestBody bytes.Buffer
	multipartWriter := multipart.NewWriter(&requestBody)
	if err := multipartWriter.WriteField("format", entity.UblFormat); err != nil {
		t.Error(err)
	}
	if err := multipartWriter.WriteField("test", "true"); err != nil {
		t.Error(err)
	}

	invoiceWriter, err := multipartWriter.CreateFormFile("invoice", "invoice.xml")
	if err != nil {
		t.Error(err)
	}
	invoice, err := ioutil.ReadFile("../../data/examples/ubl2.1/invoice.xml")
	if err != nil {
		t.Error(err)
	}
	if _, err = invoiceWriter.Write(invoice); err != nil {
		t.Error(err)
	}
	if err = multipartWriter.Close(); err != nil {
		t.Error(err)
	}
	body := requestBody.Bytes()

	req, err := http.NewRequest("POST", "/invoices", bytes.NewReader(body))
	if err != nil {
		t.Error(err)
	}
	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	response := executeAuthRequest(req, sessionToken)
	assert.Equal(t, http.StatusCreated, response.Code)

	// Limit for creating test invoices was reached, creating another test invoice should be rejected
	req, err = http.NewRequest("POST", "/invoices", bytes.NewReader(body))
	if err != nil {
		t.Error(err)
	}
	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	response = executeAuthRequest(req, sessionToken)
	assert.Equal(t, http.StatusTooManyRequests, response.Code)
}
