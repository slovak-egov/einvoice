package entity

import (
	"github.com/slovak-egov/einvoice/pkg/timeutil"
	"time"
)

const (
	UblFormat  = "ubl2.1"
	D16bFormat = "d16b"
)

type Invoice struct {
	Id          int           `json:"id"`
	Sender      string        `json:"sender"`
	Receiver    string        `json:"receiver"`
	Format      string        `json:"format"`
	Price       float64       `json:"price"`
	SupplierICO string        `json:"supplierICO"`
	CustomerICO string        `json:"customerICO"`
	CreatedAt   time.Time     `json:"createdAt"`
	IssueDate   timeutil.Date `json:"issueDate"`
	CreatedBy   int           `json:"createdBy"` // User id of invoice creator
}
