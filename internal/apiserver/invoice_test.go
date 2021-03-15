package apiserver

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/internal/testutil"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func TestGetInvoices(t *testing.T) {
	// Fill DB
	t.Cleanup(testutil.CleanDb(ctx, t, a.db.Connector))
	firstInvoiceId := testutil.CreateInvoice(
		ctx, t, a.db.Connector,
		testutil.WithAmount(100),
		testutil.WithAmountWithoutTax(50),
		testutil.WithIssueDate(timeutil.Date{time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)}),
		testutil.WithCreatedAt(time.Date(2021, 2, 1, 10, 0, 0, 0, time.UTC)),
	).Id
	secondInvoiceId := testutil.CreateInvoice(
		ctx, t, a.db.Connector,
		testutil.WithTest,
		testutil.WithAmount(200),
		testutil.WithAmountWithoutTax(150),
		testutil.WithIssueDate(timeutil.Date{time.Date(2021, 1, 2, 0, 0, 0, 0, time.UTC)}),
		testutil.WithCreatedAt(time.Date(2021, 2, 2, 10, 0, 0, 0, time.UTC)),
	).Id
	thirdInvoiceId := testutil.CreateInvoice(
		ctx, t, a.db.Connector,
		testutil.WithAmount(300),
		testutil.WithAmountWithoutTax(250),
		testutil.WithIssueDate(timeutil.Date{time.Date(2021, 1, 3, 0, 0, 0, 0, time.UTC)}),
		testutil.WithCreatedAt(time.Date(2021, 2, 3, 10, 0, 0, 0, time.UTC)),
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
		{"?test=true&issueDateFrom=2021-01-02", []int{thirdInvoiceId, secondInvoiceId}, nil},
		{"?test=true&issueDateTo=2021-01-02", []int{secondInvoiceId, firstInvoiceId}, nil},
		{"?test=true&issueDateFrom=2021-01-02&issueDateTo=2021-01-02", []int{secondInvoiceId}, nil},
		{"?test=true&uploadTimeFrom=2021-02-02T00:00:00.000%2B00:00", []int{thirdInvoiceId, secondInvoiceId}, nil},
		{"?test=true&uploadTimeTo=2021-02-02T20:00:00.000%2B00:00", []int{secondInvoiceId, firstInvoiceId}, nil},
		{"?test=true&uploadTimeFrom=2021-02-02T00:00:00.000%2B00:00&uploadTimeTo=2021-02-02T20:00:00.000%2B00:00", []int{secondInvoiceId}, nil},
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
