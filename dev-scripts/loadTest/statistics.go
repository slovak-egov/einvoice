package loadTest

import (
	"encoding/json"
	"log"
	"os"
	"sync"
	"time"
)

type EndpointStatistics struct {
	sync.RWMutex
	StatusCodes map[int]int
	Times       []time.Duration
}

func newEndpointStatistics() *EndpointStatistics {
	return &EndpointStatistics{
		StatusCodes: make(map[int]int),
	}
}

func (s *EndpointStatistics) addDataPoint(status int, duration *time.Duration) {
	s.Lock()
	if duration != nil {
		s.Times = append(s.Times, *duration / time.Millisecond)
	}
	s.StatusCodes[status]++
	s.Unlock()
}

type Statistics struct {
	CreditNote        *EndpointStatistics
	UblInvoice        *EndpointStatistics
	D16bInvoice       *EndpointStatistics
	GetInvoices       *EndpointStatistics
	UblRulesViolation *EndpointStatistics
	UblXsdViolation   *EndpointStatistics
	UblLarge          *EndpointStatistics
}

func NewStatistics() Statistics {
	return Statistics{
		newEndpointStatistics(),
		newEndpointStatistics(),
		newEndpointStatistics(),
		newEndpointStatistics(),
		newEndpointStatistics(),
		newEndpointStatistics(),
		newEndpointStatistics(),
	}
}

func (s *Statistics) Print(file string) {
	serializedResult, err := json.MarshalIndent(s, "", " ")
	if err != nil  {
		log.Println("result.marshal.failed", s)
	}

	err = os.WriteFile(file, serializedResult, 0644)
	if err != nil  {
		log.Println("result.writeFile.failed", serializedResult)
	}
}
