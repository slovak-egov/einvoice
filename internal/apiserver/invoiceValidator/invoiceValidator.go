package invoiceValidator

import (
	"bytes"
	goContext "context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/context"
)

type InvoiceValidator interface {
	ValidateD16B(ctx goContext.Context, xml []byte) error
	ValidateUBL21(ctx goContext.Context, xml []byte) error
}

func New(url string) InvoiceValidator {
	return &invoiceValidator{
		url:    url,
		client: &http.Client{},
	}
}

type invoiceValidator struct {
	url    string
	client *http.Client
}

func (v *invoiceValidator) ValidateUBL21(ctx goContext.Context, xml []byte) error {
	xmlString, err := json.Marshal(string(xml))
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("invoiceValidator.request.body.preparation.failed")
		return err
	}
	requestBody := fmt.Sprintf("{\"xml\": %s}", string(xmlString))
	req, err := http.NewRequest("POST", v.url, bytes.NewReader([]byte(requestBody)))
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("invoiceValidator.request.preparation.failed")
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := v.client.Do(req)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("invoiceValidator.request.failed")
		return err
	}

	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("invoiceValidator.response.body.read.failed")
		return err
	}

	if res.StatusCode == http.StatusOK {
		return nil
	}

	if res.StatusCode == http.StatusBadRequest {
		msg := &ValidationError{}
		if err = json.Unmarshal(body, msg); err != nil {
			context.GetLogger(ctx).WithField("error", err.Error()).Error("invoiceValidator.response.body.parse.failed")
			return err
		}
		return msg
	}

	context.GetLogger(ctx).WithFields(log.Fields{
		"error":  string(body),
		"status": res.StatusCode,
	}).Error("invoiceValidator.request.failed")
	return &RequestError{}
}

func (v *invoiceValidator) ValidateD16B(ctx goContext.Context, xml []byte) error {
	return nil
}
