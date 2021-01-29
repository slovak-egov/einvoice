package visualization_test

import (
	"github.com/slovak-egov/einvoice/internal/apiserver/visualization"
	"io/ioutil"
	"os"
	"testing"
)

func TestPdf(t *testing.T) {
	//bytes, err := ioutil.ReadFile("../../../xml/ubl21/example/ubl21_invoice.xml")
	bytes, err := ioutil.ReadFile("../../../xml/d16b/example/d16b_invoice.xml")
	if err != nil {
		t.Error(err)
	}

	pdf, err := visualization.GeneratePdf(bytes)
	if err != nil {
		t.Error(err)
	}

	f, err := os.Create("text.pdf")
	if err != nil {
		t.Error(err)
	}

	err = pdf.Write(f)
	if err != nil {
		t.Error(err)
	}
}
