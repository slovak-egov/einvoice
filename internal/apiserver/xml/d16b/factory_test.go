package d16b_test

import (
	"io/ioutil"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/apiserver/xml/d16b"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func TestFactory(t *testing.T) {
	bytes, err := ioutil.ReadFile("../../../../data/examples/d16b/invoice.xml")
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
		SupplierIco: "11190993",
		CustomerIco: "44444444",
		Price:       4000,
		IssueDate:   timeutil.Date{time.Date(2013, 4, 10, 0, 0, 0, 0, time.UTC)},
	}

	assert.Equal(t, exp, invoice)
}
