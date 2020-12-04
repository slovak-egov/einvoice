package app

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/apiserver/entity"
)

func TestGetInvoices(t *testing.T) {
	// Fill DB
	t.Cleanup(cleanDb(t))
	firstInvoiceId := createTestInvoice(t)
	secondInvoiceId := createTestInvoice(t)

	var flagtests = []struct {
		query          string
		responseLength int
		responseNextId *int
	}{
		{"", 2, nil},
		{"?format=d16b", 0, nil},
		{fmt.Sprintf("?nextId=%d&limit=1", secondInvoiceId), 1, &firstInvoiceId},
		{fmt.Sprintf("?nextId=%d", firstInvoiceId), 1, nil},
	}
	// Run tests
	for _, tt := range flagtests {
		t.Run(tt.query, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/invoices"+tt.query, nil)
			response := executeRequest(req)

			checkResponseCode(t, http.StatusOK, response.Code)

			var parsedResponse PagedInvoices
			json.Unmarshal(response.Body.Bytes(), &parsedResponse)

			assert.Equal(t, tt.responseLength, len(parsedResponse.Invoices))

			assert.Equal(t, tt.responseNextId, parsedResponse.NextId)
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

	assert.Equal(t, id, parsedResponse.Id)

	// Try to get nonexistent invoice
	req, _ = http.NewRequest("GET", fmt.Sprintf("/invoices/%d", id+1), nil)
	response = executeRequest(req)

	checkResponseCode(t, http.StatusNotFound, response.Code)
}
