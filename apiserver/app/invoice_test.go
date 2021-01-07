package app

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/pkg/entity"
)

func TestGetInvoices(t *testing.T) {
	// Fill DB
	t.Cleanup(cleanDb(t))
	firstInvoiceId := createTestInvoice(t, false, true)
	createTestInvoice(t, true, true)
	thirdInvoiceId := createTestInvoice(t, false, true)
	createTestInvoice(t, false, false)

	var flagtests = []struct {
		query          string
		responseLength int
		responseNextId *int
	}{
		{"", 2, nil},
		{"?test=true&ico=11111111", 3, nil},
		{"?format=d16b", 0, nil},
		{"?ico=11111112", 0, nil},
		{fmt.Sprintf("?startId=%d&limit=1", thirdInvoiceId), 1, &firstInvoiceId},
		{fmt.Sprintf("?startId=%d", firstInvoiceId), 1, nil},
		{fmt.Sprintf("?startId=%d&order=asc", firstInvoiceId), 2, nil},
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
	id1 := createTestInvoice(t, false, true)
	id2 := createTestInvoice(t, false, false)

	req, _ := http.NewRequest("GET", fmt.Sprintf("/invoices/%d", id1), nil)
	response := executeRequest(req)

	checkResponseCode(t, http.StatusOK, response.Code)
	var parsedResponse entity.Invoice
	json.Unmarshal(response.Body.Bytes(), &parsedResponse)

	assert.Equal(t, id1, parsedResponse.Id)

	// Try to get private invoice
	req, _ = http.NewRequest("GET", fmt.Sprintf("/invoices/%d", id2), nil)
	response = executeRequest(req)

	checkResponseCode(t, http.StatusUnauthorized, response.Code)

	// Try to get nonexistent invoice
	req, _ = http.NewRequest("GET", fmt.Sprintf("/invoices/%d", id2+1), nil)
	response = executeRequest(req)

	checkResponseCode(t, http.StatusNotFound, response.Code)
}
