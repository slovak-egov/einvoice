package loadTest

import (
	"bytes"
	"crypto/rsa"
	"log"
	"math/rand"
	"sync"
	"time"

	"github.com/slovak-egov/einvoice/dev-scripts/loadTest/config"
)

type App struct {
	config   *config.Configuration
	examples *Examples
	result   Statistics
}

func NewApp() *App {
	rand.Seed(time.Now().UTC().UnixNano())
	appConfig := config.New()

	a := App{
		config:   appConfig,
		examples: NewExamples(appConfig.ExamplesPath),
		result:   NewStatistics(),
	}

	return &a
}

func (a *App) getInvoices() (int, *time.Duration, error) {
	req, err := newRequest("GET", a.config.ApiServerUrl+"/invoices", nil, nil)
	if err != nil {
		return 0, nil, err
	}
	status, duration, err := sendRequest(req)
	return status, &duration, err
}

func (a *App) createInvoice(invoice []byte, userId int, privateKey *rsa.PrivateKey) (int, *time.Duration, error) {
	apiKey, err := getUserJwt(userId, privateKey)
	if err != nil {
		log.Println("getUserJwt.failed", userId, err)
		return 0, nil, err
	}

	var requestBody bytes.Buffer
	if _, err := requestBody.Write(invoice); err != nil {
		log.Println("createInvoice.bodyWrite.failed", err)
		return 0, nil, err
	}
	req, err := newRequest(
		"POST",
		a.config.ApiServerUrl+"/invoices",
		&requestBody,
		map[string]string{"X-API-Key": apiKey},
	)
	if err != nil {
		return 0, nil, err
	}

	status, duration, err := sendRequest(req)
	return status, &duration, err
}

func (a *App) Run() {
	var wg sync.WaitGroup
	wg.Add(a.config.ThreadNumber)
	for i := 0; i < a.config.ThreadNumber; i++ {
		go func() {
			for i := 0; i < a.config.IterationsNumber; i++ {
				a.testEndpoint()
			}
			wg.Done()
		}()
	}
	wg.Wait()

	a.result.Print(a.config.OutputFile)
}

func (a *App) testEndpoint() {
	switch x := rand.Float64(); {
	case x < 0.5:
		var example []byte
		var stats *EndpointStatistics
		switch y := rand.Float64(); {
		case y < 0.25:
			example = a.examples.UblCreditNote
			stats = a.result.CreditNote
		case y < 0.6:
			example = a.examples.UblInvoice
			stats = a.result.UblInvoice
		case y < 0.85:
			example = a.examples.D16bInvoice
			stats = a.result.D16bInvoice
		case y < 0.9:
			example = a.examples.UblLarge
			stats = a.result.UblLarge
		case y < 0.95:
			example = a.examples.UblViolatingRules
			stats = a.result.UblRulesViolation
		default:
			example = a.examples.UblViolatingXsd
			stats = a.result.UblXsdViolation
		}
		status, duration, err := a.createInvoice(example, a.config.User.Id, a.config.User.PrivateKey)
		if err != nil  {
			log.Println("createInvoice.failed", err)
		}
		stats.addDataPoint(status, duration)
	default:
		status, duration, err := a.getInvoices()
		if err != nil  {
			log.Println("getInvoices.failed", err)
		}
		a.result.GetInvoices.addDataPoint(status, duration)
	}
}
