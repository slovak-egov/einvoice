package invoiceValidator

import (
	"bytes"
	goContext "context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/apiserver/invoiceValidator/mock"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type InvoiceValidator interface {
	ValidateD16B(ctx goContext.Context, xml []byte) error
	ValidateUBL21(ctx goContext.Context, xml []byte) error
}

func New(url string) InvoiceValidator {
	if url == "" {
		return &mock.InvoiceValidator{}
	}
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
	requestBody, err := json.Marshal(map[string]string{"xml": string(xml)})
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("invoiceValidator.request.body.preparation.failed")
		return err
	}

	res, err := v.client.Post(v.url, "application/json", bytes.NewReader([]byte(requestBody)))
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("invoiceValidator.request.failed")
		return &RequestError{err}
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
	return &RequestError{fmt.Errorf("response status %d", res.StatusCode)}
}

func (v *invoiceValidator) ValidateD16B(ctx goContext.Context, xml []byte) error {
	return nil
}
