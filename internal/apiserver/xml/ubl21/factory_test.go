package ubl21_test

import (
	"io/ioutil"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/internal/apiserver/xml/ubl21"
	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func TestFactory(t *testing.T) {
	bytes, err := ioutil.ReadFile("../../../../data/examples/ubl2.1/invoice.xml")
	if err != nil {
		t.Error(err.Error())
	}

	invoice, err := ubl21.Create(bytes)
	if err != nil {
		t.Error(err.Error())
	}

	exp := &entity.Invoice{
		Sender:      "Global Trade Chain",
		Receiver:    "Project Services",
		Format:      "ubl2.1",
		SupplierIco: "11190993",
		CustomerIco: "22222222",
		Price:       12500,
		IssueDate:   timeutil.Date{time.Date(2011, 9, 22, 0, 0, 0, 0, time.UTC)},
	}

	assert.Equal(t, exp, invoice)
}
