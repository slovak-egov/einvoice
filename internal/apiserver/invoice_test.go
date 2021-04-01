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
	"github.com/slovak-egov/einvoice/pkg/ulid"
)

func TestGetInvoices(t *testing.T) {
	// Fill DB
	t.Cleanup(testutil.CleanDb(ctx, t, a.db.Connector))

	ids := []string{
		ulid.New(time.Date(2021, 2, 1, 10, 0, 0, 0, time.UTC)).String(),
		ulid.New(time.Date(2021, 2, 2, 10, 0, 0, 0, time.UTC)).String(),
		ulid.New(time.Date(2021, 2, 3, 10, 0, 0, 0, time.UTC)).String(),
	}

	testutil.CreateInvoice(
		ctx, t, a.db.Connector, ids[0],
		testutil.WithAmount(100),
		testutil.WithAmountCurrency("EUR"),
		testutil.WithAmountWithoutVat(50),
		testutil.WithAmountWithoutVatCurrency("EUR"),
		testutil.WithIssueDate(timeutil.Date{time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)}),
		testutil.WithCustomerName("Customer 1"),
		testutil.WithSupplierName("Supplier 1"),
		testutil.WithCustomerIco("11111111"),
		testutil.WithSupplierIco("22222222"),
	)
	testutil.CreateInvoice(
		ctx, t, a.db.Connector, ids[1],
		testutil.WithTest,
		testutil.WithAmount(200),
		testutil.WithAmountCurrency("CZK"),
		testutil.WithAmountWithoutVat(150),
		testutil.WithAmountWithoutVatCurrency("EUR"),
		testutil.WithIssueDate(timeutil.Date{time.Date(2021, 1, 2, 0, 0, 0, 0, time.UTC)}),
		testutil.WithCustomerName("Customer 2"),
		testutil.WithSupplierName("Supplier 2"),
		testutil.WithCustomerIco("11111111"),
		testutil.WithSupplierIco("33333333"),
	)
	testutil.CreateInvoice(
		ctx, t, a.db.Connector, ids[2],
		testutil.WithAmount(300),
		testutil.WithAmountCurrency("EUR"),
		testutil.WithAmountWithoutVat(250),
		testutil.WithAmountWithoutVatCurrency("CZK"),
		testutil.WithIssueDate(timeutil.Date{time.Date(2021, 1, 3, 0, 0, 0, 0, time.UTC)}),
		testutil.WithCustomerName("Customer 3"),
		testutil.WithSupplierName("Supplier 3"),
		testutil.WithCustomerIco("44444444"),
		testutil.WithSupplierIco("33333333"),
	)

	var flagtests = []struct {
		query            string
		responseInvoices []string
		responseNextId   *string
	}{
		{"", []string{ids[2], ids[0]}, nil},
		{"?test=true&ico=11111111", []string{ids[2], ids[1], ids[0]}, nil},
		{"?format=d16b", nil, nil},
		{fmt.Sprintf("?startId=%s&limit=1", ids[2]), []string{ids[2]}, &ids[0]},
		{fmt.Sprintf("?startId=%s", ids[0]), []string{ids[0]}, nil},
		{fmt.Sprintf("?startId=%s&order=asc", ids[0]), []string{ids[0], ids[2]}, nil},
		{"?test=true&amountFrom=190", []string{ids[2], ids[1]}, nil},
		{"?test=true&amountTo=210", []string{ids[1], ids[0]}, nil},
		{"?test=true&amountFrom=190&amountTo=210", []string{ids[1]}, nil},
		{"?test=true&amountWithoutVatFrom=140", []string{ids[2], ids[1]}, nil},
		{"?test=true&amountWithoutVatTo=160", []string{ids[1], ids[0]}, nil},
		{"?test=true&amountWithoutVatFrom=140&amountWithoutVatTo=160", []string{ids[1]}, nil},
		{"?test=true&issueDateFrom=2021-01-02", []string{ids[2], ids[1]}, nil},
		{"?test=true&issueDateTo=2021-01-02", []string{ids[1], ids[0]}, nil},
		{"?test=true&issueDateFrom=2021-01-02&issueDateTo=2021-01-02", []string{ids[1]}, nil},
		{
			"?test=true&uploadTimeFrom=2021-02-02T00:00:00.000%2B00:00",
			[]string{ids[2], ids[1]},
			nil,
		},
		{
			"?test=true&uploadTimeTo=2021-02-02T20:00:00.000%2B00:00",
			[]string{ids[1], ids[0]},
			nil,
		},
		{
			"?test=true&uploadTimeFrom=2021-02-02T00:00:00.000%2B00:00&uploadTimeTo=2021-02-02T20:00:00.000%2B00:00",
			[]string{ids[1]},
			nil,
		},
		{"?test=true&customerName=cust", []string{ids[2], ids[1], ids[0]}, nil},
		{"?test=true&customerName=tome", []string{ids[2], ids[1], ids[0]}, nil},
		{"?test=true&customerName=mer%202", []string{ids[1]}, nil},
		{"?test=true&customerName=x", []string{}, nil},
		{"?test=true&supplierName=supp", []string{ids[2], ids[1], ids[0]}, nil},
		{"?test=true&supplierName=ppli", []string{ids[2], ids[1], ids[0]}, nil},
		{"?test=true&supplierName=ier%202", []string{ids[1]}, nil},
		{"?test=true&supplierName=x", []string{}, nil},
		{"?test=true&customerIco=11111111", []string{ids[1], ids[0]}, nil},
		{"?test=true&customerIco=44444444", []string{ids[2]}, nil},
		{"?test=true&customerIco=99999999", []string{}, nil},
		{"?test=true&supplierIco=22222222", []string{ids[0]}, nil},
		{"?test=true&supplierIco=33333333", []string{ids[2], ids[1]}, nil},
		{"?test=true&supplierIco=99999999", []string{}, nil},
		{"?test=true&amountCurrency=EUR", []string{ids[2], ids[0]}, nil},
		{"?test=true&amountCurrency=CZK", []string{ids[1]}, nil},
		{"?test=true&amountCurrency=SVK", []string{}, nil},
		{"?test=true&amountWithoutVatCurrency=EUR", []string{ids[1], ids[0]}, nil},
		{"?test=true&amountWithoutVatCurrency=CZK", []string{ids[2]}, nil},
		{"?test=true&amountWithoutVatCurrency=SVK", []string{}, nil},
	}
	// Run tests
	for _, tt := range flagtests {
		t.Run(tt.query, func(t *testing.T) {
			req, err := http.NewRequest("GET", "/invoices"+tt.query, nil)
			if err != nil {
				t.Error(err)
			}
			response := testutil.ExecuteRequest(a, req)

			assert.Equal(t, http.StatusOK, response.Code)

			var parsedResponse PagedInvoices
			err = json.Unmarshal(response.Body.Bytes(), &parsedResponse)
			if err != nil {
				t.Error(err)
			}

			assert.Equal(t, len(tt.responseInvoices), len(parsedResponse.Invoices))

			if len(tt.responseInvoices) > 0 {
				var ids []string
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
	ids := []string{"01776d7e-4661-138a-26e3-437102097b13", "01776d7e-4661-138a-26e3-437102097b14"}
	testutil.CreateInvoice(ctx, t, a.db.Connector, ids[0])

	req, err := http.NewRequest("GET", fmt.Sprintf("/invoices/%s", ids[0]), nil)
	if err != nil {
		t.Error(err)
	}
	response := testutil.ExecuteRequest(a, req)

	assert.Equal(t, http.StatusOK, response.Code)
	var parsedResponse entity.Invoice
	json.Unmarshal(response.Body.Bytes(), &parsedResponse)

	assert.Equal(t, ids[0], parsedResponse.Id)

	// Try to get nonexistent invoice
	req, err = http.NewRequest("GET", fmt.Sprintf("/invoices/%s", ids[1]), nil)
	if err != nil {
		t.Error(err)
	}
	response = testutil.ExecuteRequest(a, req)

	assert.Equal(t, http.StatusNotFound, response.Code)
}
