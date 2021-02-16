package xml_test

import (
	"io/ioutil"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/entity"
)

func TestValidation(t *testing.T) {
	var flagtests = []struct {
		format          string
		testInvoicePath string
	}{
		{entity.UblFormat, "../../../data/examples/ubl2.1/invoice.xml"},
		{entity.D16bFormat, "../../../data/examples/d16b/invoice.xml"},
	}
	for _, tt := range flagtests {
		t.Run(tt.format, func(t *testing.T) {
			bytes, err := ioutil.ReadFile(tt.testInvoicePath)
			if err != nil {
				t.Fatal(err)
			}

			assert.Nil(t, validator.Validate(bytes, tt.format))
		})
	}
}
