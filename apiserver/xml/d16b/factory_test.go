package d16b_test

import (
	"github.com/slovak-egov/einvoice/pkg/timeutil"
	"io/ioutil"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/apiserver/xml/d16b"
)

func TestFactory(t *testing.T) {
	bytes, err := ioutil.ReadFile("../../../xml/d16b/example/d16b_invoice.xml")
	if err != nil {
		t.Error(err.Error())
	}

	invoice, err := d16b.Create(bytes)
	if err != nil {
		t.Error(err.Error())
	}

	exp := &entity.Invoice{
		Sender:      "SellerCompany",
		Receiver:    "Buyercompany ltd",
		Format:      "d16b",
		SupplierICO: "11190993",
		CustomerICO: "44444444",
		Price:       4000,
		IssueDate:   timeutil.Date{time.Date(2013, 4, 10, 0, 0, 0, 0, time.UTC)},
	}

	assert.Equal(t, exp, invoice)
}
