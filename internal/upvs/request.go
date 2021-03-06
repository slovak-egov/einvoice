package upvs

import (
	goContext "context"
	"io"
	"net/http"

	log "github.com/sirupsen/logrus"

	"github.com/slovak-egov/einvoice/pkg/context"
)

type request struct {
	method  string
	url     string
	headers map[string]string
	body    io.Reader
}

func (c *Connector) sendRequest(ctx goContext.Context, request *request) ([]byte, error) {
	upvsReq, err := http.NewRequest(request.method, c.baseUrl+request.url, request.body)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("upvs.sendRequest.preparation.failed")
		return nil, err
	}

	for headerName, headerValue := range request.headers {
		upvsReq.Header.Add(headerName, headerValue)
	}

	upvsRes, err := c.client.Do(upvsReq)
	if err != nil {
		context.GetLogger(ctx).WithFields(log.Fields{
			"error":      err.Error(),
			"requestUrl": request.url,
		}).Error("upvs.sendRequest.failed")
		return nil, &UpvsError{err.Error()}
	}

	defer upvsRes.Body.Close()

	body, err := io.ReadAll(upvsRes.Body)
	if err != nil {
		context.GetLogger(ctx).WithField("error", err.Error()).Error("upvs.sendRequest.readResponse.failed")
		return nil, err
	}

	if upvsRes.StatusCode != http.StatusOK {
		context.GetLogger(ctx).
			WithFields(log.Fields{
				"requestUrl": request.url,
				"status":     upvsRes.StatusCode,
				"body":       string(body),
			}).
			Error("upvs.sendRequest.errorStatusCode")

		return nil, &UpvsError{"ÚPVS responded with: " + upvsRes.Status}
	}

	return body, nil
}
