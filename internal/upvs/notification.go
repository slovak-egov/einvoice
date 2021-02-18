package upvs

import (
	goContext "context"
	"encoding/json"
	"errors"
	"net/url"
	"strings"

	"github.com/slovak-egov/einvoice/pkg/context"
)

func (c *Connector) SendInvoiceNotification(ctx goContext.Context, skTalkMessage string) error {
	signedApiToken, err := c.signApiToken()
	if err != nil {
		context.GetLogger(ctx).
			WithField("error", err.Error()).
			Error("upvs.sendInvoiceNotification.signApiToken.failed")

		return err
	}

	data := url.Values{}
	data.Set("message", skTalkMessage)

	response, err := c.sendRequest(
		ctx,
		&Request{
			"POST",
			"/api/sktalk/receive",
			map[string]string{
				"Authorization": "Bearer " + signedApiToken,
				"Content-Type":  "application/json",
			},
			strings.NewReader(data.Encode()),
		},
	)
	if err != nil {
		return err
	}

	var parsedResponse struct {
		ReceiveResult int `json:"receive_result"`
	}
	if err = json.Unmarshal(response, &parsedResponse); err != nil {
		context.GetLogger(ctx).
			WithField("error", err.Error()).
			Error("upvs.sendInvoiceNotification.parseResponse.failed")

		return err
	}

	if parsedResponse.ReceiveResult != 0 {
		context.GetLogger(ctx).
			WithField("receiveResult", parsedResponse.ReceiveResult).
			Error("upvs.sendInvoiceNotification.receiveResult")

		return errors.New("upvs.sendInvoiceNotification.failed")
	}

	return nil
}
