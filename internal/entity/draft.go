package entity

import (
	"encoding/json"
	"time"

	"github.com/slovak-egov/einvoice/pkg/ulid"
)

type Draft struct {
	Id        string          `json:"id"`
	CreatedAt *time.Time      `json:"createdAt"`
	Name      string          `json:"name"`
	Data      json.RawMessage `json:"data,omitempty"`
}

// Derive created at from id
func (d *Draft) CalculateCreatedAt() {
	parsedId, err := ulid.Parse(d.Id)
	if err != nil {
		panic(err)
	}
	createdAt := parsedId.Time().UTC()
	d.CreatedAt = &createdAt
}
