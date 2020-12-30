package app

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

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func TestCreateInvoice(t *testing.T) {
	t.Cleanup(cleanDb(t))
	user, sessionToken := createTestUser(t, "")

	var requestBody bytes.Buffer
	multipartWriter := multipart.NewWriter(&requestBody)
	multipartWriter.WriteField("format", entity.UblFormat)

	invoiceWriter, _ := multipartWriter.CreateFormFile("invoice", "ubl21_invoice.xml")
	invoice, _ := ioutil.ReadFile("../../xml/ubl21/example/ubl21_invoice.xml")
	invoiceWriter.Write(invoice)
	multipartWriter.Close()

	req, _ := http.NewRequest("POST", "/invoices", &requestBody)
	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	response := executeAuthRequest(req, sessionToken)
	checkResponseCode(t, http.StatusCreated, response.Code)

	var createdResponse entity.Invoice
	err := json.Unmarshal(response.Body.Bytes(), &createdResponse)
	if err != nil {
		t.Error(err.Error())
	}
	expectedResponse := entity.Invoice{
		Id:          createdResponse.Id,        // No need to assert this param,
		CreatedAt:   createdResponse.CreatedAt, // No need to assert this param
		Sender:      "Custom Cotter Pins",
		Receiver:    "North American Veeblefetzer",
		Price:       100,
		SupplierIco: "11190993",
		CustomerIco: "22222222",
		Format:      entity.UblFormat,
		CreatedBy:   user.Id,
		IssueDate:   timeutil.Date{time.Date(2011, 9, 22, 0, 0, 0, 0, time.UTC)},
		IsPublic:    true,
	}
	if !reflect.DeepEqual(createdResponse, expectedResponse) {
		t.Errorf("Expected created response was %v. Got %v", expectedResponse, createdResponse)
	}

	// Try to get invoice metadata through API
	req, _ = http.NewRequest("GET", fmt.Sprintf("/invoices/%d", createdResponse.Id), nil)
	response = executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)
	var getResponse entity.Invoice
	json.Unmarshal(response.Body.Bytes(), &getResponse)
	if !reflect.DeepEqual(createdResponse, getResponse) {
		t.Errorf("Created response was %v. While GET request returned %v", createdResponse, getResponse)
	}

	// Try to get actual invoice through API
	req, _ = http.NewRequest("GET", fmt.Sprintf("/invoices/%d/detail", createdResponse.Id), nil)
	response = executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)
	if !bytes.Equal(invoice, response.Body.Bytes()) {
		t.Errorf("Response was incorrect. We expected %s", invoice)
	}
}

func TestRateLimiter(t *testing.T) {
	t.Cleanup(cleanDb(t))
	a.cache.FlushAll(ctx)
	_, sessionToken := createTestUser(t, "")

	var requestBody bytes.Buffer
	multipartWriter := multipart.NewWriter(&requestBody)
	multipartWriter.WriteField("format", entity.UblFormat)
	multipartWriter.WriteField("test", "true")

	invoiceWriter, _ := multipartWriter.CreateFormFile("invoice", "ubl21_invoice.xml")
	invoice, _ := ioutil.ReadFile("../../xml/ubl21/example/ubl21_invoice.xml")
	invoiceWriter.Write(invoice)
	multipartWriter.Close()
	body := requestBody.Bytes()

	for i := 0; i < 20; i++ {
		req, _ := http.NewRequest("POST", "/invoices", bytes.NewReader(body))
		req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

		response := executeAuthRequest(req, sessionToken)
		checkResponseCode(t, http.StatusCreated, response.Code)
	}

	req, _ := http.NewRequest("POST", "/invoices", bytes.NewReader(body))
	req.Header.Set("Content-Type", multipartWriter.FormDataContentType())

	response := executeAuthRequest(req, sessionToken)
	checkResponseCode(t, http.StatusTooManyRequests, response.Code)

	a.cache.FlushAll(ctx)
}
