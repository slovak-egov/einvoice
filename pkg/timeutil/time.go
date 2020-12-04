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

func ParseDate(s string) (*Date, error) {
	t, err := time.Parse(DateLayoutISO, s)
	if err != nil {
		return nil, err
	}
	return &Date{t}, err
}

func (d *Date) ScanValue(rd types.Reader, n int) (err error) {
	d.Time, err = types.ScanTime(rd, n)
	return
}

func (d *Date) AppendValue(b []byte, flags int) ([]byte, error) {
	return types.AppendTime(b, d.Time, flags), nil
}

func (d *Date) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.Format(DateLayoutISO))
}

func (d *Date) UnmarshalJSON(data []byte) error {
	var dateString = new(string)
	err := json.Unmarshal(data, &dateString)
	if err != nil {
		return err
	}
	d.Time, err = time.Parse(DateLayoutISO, *dateString)
	return err
}
