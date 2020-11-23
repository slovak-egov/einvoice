package app

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/slovak-egov/einvoice/apiserver/entity"
)

var flagtests = []struct {
	query          string
	responseLength int
}{
	{"", 1},
	{"?format=d16b", 0},
}

func TestGetInvoices(t *testing.T) {
	// Fill DB
	t.Cleanup(cleanDb(t))
	createTestInvoice(t)

	// Run tests
	for _, tt := range flagtests {
		t.Run(tt.query, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/invoices"+tt.query, nil)
			response := executeRequest(req)

			checkResponseCode(t, http.StatusOK, response.Code)

			var parsedResponse []entity.Invoice
			json.Unmarshal(response.Body.Bytes(), &parsedResponse)

			if len(parsedResponse) != tt.responseLength {
				t.Errorf("Expected an array of length %d. Got %s", tt.responseLength, response.Body.String())
			}
		})
	}
}

func TestGetInvoice(t *testing.T) {
	t.Cleanup(cleanDb(t))
	id := createTestInvoice(t)

	req, _ := http.NewRequest("GET", fmt.Sprintf("/invoices/%d", id), nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)
	var parsedResponse entity.Invoice
	json.Unmarshal(response.Body.Bytes(), &parsedResponse)
	if parsedResponse.Id != id {
		t.Errorf("Expected invoice with id %d. Got %d", id, parsedResponse.Id)
	}

	// Try to get nonexistent invoice
	req, _ = http.NewRequest("GET", fmt.Sprintf("/invoices/%d", id+1), nil)
	response = executeRequest(req)

	checkResponseCode(t, http.StatusNotFound, response.Code)
}
