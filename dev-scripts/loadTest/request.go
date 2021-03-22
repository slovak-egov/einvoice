package loadTest

import (
	"io"
	"log"
	"net/http"
	"time"
)

func newRequest(method, url string, body io.Reader, headers map[string]string) (*http.Request, error) {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		log.Println("requestPreparation.failed", method, url, err)
		return nil, err
	}

	for headerName, headerValue := range headers {
		req.Header.Add(headerName, headerValue)
	}
	return req, nil
}

func sendRequest(req *http.Request) (int, time.Duration, error) {
	client := http.Client{}
	startTime := time.Now()
	res, err := client.Do(req)
	duration := time.Now().Sub(startTime)
	if err != nil {
		log.Println("sendRequest.failed", req.Method, req.URL, err)
		return 0, duration, err
	}

	return res.StatusCode, duration, nil
}
