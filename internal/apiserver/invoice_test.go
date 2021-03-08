package apiserver

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/testutil"
)

func TestGetInvoices(t *testing.T) {
	// Fill DB
	t.Cleanup(testutil.CleanDb(ctx, t, a.db.Connector))
	firstInvoiceId := testutil.CreateInvoice(
		ctx, t, a.db.Connector,
		testutil.WithAmount(100),
		testutil.WithAmountWithoutTax(50),
	).Id
	secondInvoiceId := testutil.CreateInvoice(
		ctx, t, a.db.Connector,
		testutil.WithTest,
		testutil.WithAmount(200),
		testutil.WithAmountWithoutTax(150),
	).Id
	thirdInvoiceId := testutil.CreateInvoice(
		ctx, t, a.db.Connector,
		testutil.WithAmount(300),
		testutil.WithAmountWithoutTax(250),
	).Id

	var flagtests = []struct {
		query            string
		responseInvoices []int
		responseNextId   *int
	}{
		{"", []int{thirdInvoiceId, firstInvoiceId}, nil},
		{"?test=true&ico=11111111", []int{thirdInvoiceId, secondInvoiceId, firstInvoiceId}, nil},
		{"?format=d16b", nil, nil},
		{"?ico=11111112", nil, nil},
		{fmt.Sprintf("?startId=%d&limit=1", thirdInvoiceId), []int{thirdInvoiceId}, &firstInvoiceId},
		{fmt.Sprintf("?startId=%d", firstInvoiceId), []int{firstInvoiceId}, nil},
		{fmt.Sprintf("?startId=%d&order=asc", firstInvoiceId), []int{firstInvoiceId, thirdInvoiceId}, nil},
		{"?test=true&amountFrom=190", []int{thirdInvoiceId, secondInvoiceId}, nil},
		{"?test=true&amountTo=210", []int{secondInvoiceId, firstInvoiceId}, nil},
		{"?test=true&amountFrom=190&amountTo=210", []int{secondInvoiceId}, nil},
		{"?test=true&amountWithoutVatFrom=140", []int{thirdInvoiceId, secondInvoiceId}, nil},
		{"?test=true&amountWithoutVatTo=160", []int{secondInvoiceId, firstInvoiceId}, nil},
		{"?test=true&amountWithoutVatFrom=140&amountWithoutVatTo=160", []int{secondInvoiceId}, nil},
	}
	// Run tests
	for _, tt := range flagtests {
		t.Run(tt.query, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/invoices"+tt.query, nil)
			response := testutil.ExecuteRequest(a, req)

			assert.Equal(t, http.StatusOK, response.Code)

			var parsedResponse PagedInvoices
			json.Unmarshal(response.Body.Bytes(), &parsedResponse)

			assert.Equal(t, len(tt.responseInvoices), len(parsedResponse.Invoices))

			if len(tt.responseInvoices) > 0 {
				var ids []int
				for _, invoice := range parsedResponse.Invoices {
					ids = append(ids, invoice.Id)
				}
				assert.Equal(t, tt.responseInvoices, ids)
			}

			assert.Equal(t, tt.responseNextId, parsedResponse.NextId)
		})
	}
}

func TestGetInvoice(t *testing.T) {
	t.Cleanup(testutil.CleanDb(ctx, t, a.db.Connector))
	id := testutil.CreateInvoice(ctx, t, a.db.Connector).Id

	req, _ := http.NewRequest("GET", fmt.Sprintf("/invoices/%d", id), nil)
	response := testutil.ExecuteRequest(a, req)

	assert.Equal(t, http.StatusOK, response.Code)
	var parsedResponse entity.Invoice
	json.Unmarshal(response.Body.Bytes(), &parsedResponse)

	assert.Equal(t, id, parsedResponse.Id)

	// Try to get nonexistent invoice
	req, _ = http.NewRequest("GET", fmt.Sprintf("/invoices/%d", id+1), nil)
	response = testutil.ExecuteRequest(a, req)

	assert.Equal(t, http.StatusNotFound, response.Code)
}
