package timeutil

import (
	"time"

	"github.com/go-pg/pg/v10/types"
)

const DateLayoutISO = "2006-01-02"

type Date struct {
	Time time.Time
}

var _ types.ValueScanner = (*Date)(nil)

func (d *Date) ScanValue(rd types.Reader, n int) (err error) {
	d.Time, err = types.ScanTime(rd, n)
	return
}

var _ types.ValueAppender = (*Date)(nil)

func (d *Date) AppendValue(b []byte, flags int) ([]byte, error) {
	return types.AppendTime(b, d.Time, flags), nil
}

func (d *Date) MarshalJSON() ([]byte, error) {
	return []byte(d.Time.Format(DateLayoutISO)), nil
}

func (d *Date) UnmarshalJSON(data []byte) (err error) {
	d.Time, err = time.Parse(DateLayoutISO, string(data))
	return
}
