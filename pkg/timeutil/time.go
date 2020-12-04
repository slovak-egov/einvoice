package timeutil

import (
	"encoding/json"
	"time"

	"github.com/go-pg/pg/v10/types"
)

const DateLayoutISO = "2006-01-02"

type Date struct {
	time.Time
}

func (d *Date) ScanValue(rd types.Reader, n int) (err error) {
	d.Time, err = types.ScanTime(rd, n)
	return
}

func (d *Date) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.Format(DateLayoutISO))
}
