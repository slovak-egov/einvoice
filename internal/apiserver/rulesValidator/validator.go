package rulesValidator

import (
	"bytes"
	goContext "context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/internal/apiserver/rulesValidator/mock"
	"github.com/slovak-egov/einvoice/pkg/context"
)

type Validator interface {
	Validate(ctx goContext.Context, xml []byte, format string) error
}

type validator struct {
	url    string
	client *http.Client
}

func New(url string) Validator {
	if url == "" {
		return &mock.RulesValidator{}
	}
	return &validator{
		url:    url,
		client: &http.Client{},
	}
}

func (v *validator) Validate(ctx goContext.Context, xml []byte, format string) error {
	res, err := v.client.Post(
		fmt.Sprintf("%s?format=%s", v.url, format),
		"application/xml",
		bytes.NewReader(xml),
	)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("rulesValidator.request.failed")
		return &RequestError{err}
	}

	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("rulesValidator.response.body.read.failed")
		return err
	}

	if res.StatusCode == http.StatusOK {
		return nil
	}

	if res.StatusCode == http.StatusBadRequest {
		msg := &ValidationError{}
		if err = json.Unmarshal(body, msg); err != nil {
			context.GetLogger(ctx).WithField("error", err.Error()).Error("rulesValidator.response.body.parse.failed")
			return err
		}
		return msg
	}

	context.GetLogger(ctx).WithFields(log.Fields{
		"error":  string(body),
		"status": res.StatusCode,
	}).Error("rulesValidator.request.failed")
	return &RequestError{fmt.Errorf("response status %d", res.StatusCode)}
}
