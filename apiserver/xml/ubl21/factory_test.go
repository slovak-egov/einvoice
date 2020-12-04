package ubl21_test

import (
	"github.com/slovak-egov/einvoice/pkg/timeutil"
	"io/ioutil"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/apiserver/xml/ubl21"
)

func TestFactory(t *testing.T) {
	bytes, err := ioutil.ReadFile("../../../xml/ubl21/example/ubl21_invoice.xml")
	if err != nil {
		t.Error(err.Error())
	}

	invoice, err := ubl21.Create(bytes)
	if err != nil {
		t.Error(err.Error())
	}

	exp := &entity.Invoice{
		Sender:      "Custom Cotter Pins",
		Receiver:    "North American Veeblefetzer",
		Format:      "ubl2.1",
		SupplierICO: "11190993",
		CustomerICO: "22222222",
		Price:       100,
		IssueDate:   timeutil.Date{Time: time.Date(2011, 9, 22, 0, 0, 0, 0, time.UTC)},
	}

	assert.Equal(t, exp, invoice)
}
