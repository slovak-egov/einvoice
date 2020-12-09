package entity

import (
	"time"

	"github.com/slovak-egov/einvoice/pkg/timeutil"
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
	SupplierIco string        `json:"supplierIco"`
	CustomerIco string        `json:"customerIco"`
	CreatedAt   time.Time     `json:"createdAt"`
	IssueDate   timeutil.Date `json:"issueDate"`
	CreatedBy   int           `json:"createdBy"` // User id of invoice creator
	Test        bool          `json:"test"`
	IsPublic    bool          `json:"isPublic"`
}
