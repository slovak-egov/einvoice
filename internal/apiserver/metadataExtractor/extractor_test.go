package metadataExtractor

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func TestParseInvoice(t *testing.T) {
	var flagtests = []struct {
		format           string
		testInvoicePath  string
		expectedMetadata entity.Invoice
	}{
		{
			entity.UblFormat,
			"../../../data/examples/ubl2.1/invoice.xml",
			entity.Invoice{
				Sender:      "Global Trade Chain",
				Receiver:    "Project Services",
				Format:      entity.UblFormat,
				SupplierIco: "11190993",
				CustomerIco: "22222222",
				Price:       12500,
				IssueDate:   timeutil.Date{time.Date(2011, 9, 22, 0, 0, 0, 0, time.UTC)},
			},
		},
		{
			entity.D16bFormat,
			"../../../data/examples/d16b/invoice.xml",
			entity.Invoice{
				Sender:      "Bluem BV",
				Receiver:    "Provide Verzekeringen",
				Format:      entity.D16bFormat,
				SupplierIco: "11190993",
				CustomerIco: "44444444",
				Price:       177.87,
				IssueDate:   timeutil.Date{time.Date(2015, 4, 1, 0, 0, 0, 0, time.UTC)},
			},
		},
	}
	for _, tt := range flagtests {
		t.Run(tt.format, func(t *testing.T) {
			bytes, err := os.ReadFile(tt.testInvoicePath)
			if err != nil {
				t.Fatal(err)
			}

			invoice, err := ParseInvoice(bytes, tt.format)
			if err != nil {
				t.Error(err)
			}

			assert.Equal(t, &tt.expectedMetadata, invoice)
		})
	}
}

