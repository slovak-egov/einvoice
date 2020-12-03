package entity

import (
	"encoding/json"
	"time"

	"github.com/jinzhu/copier"

	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

const (
	UblFormat  = "ubl2.1"
	D16bFormat = "d16b"
)

type Invoice struct {
	Id          int       `json:"id"`
	Sender      string    `json:"sender"`
	Receiver    string    `json:"receiver"`
	Format      string    `json:"format"`
	Price       float64   `json:"price"`
	SupplierICO string    `json:"supplierICO"`
	CustomerICO string    `json:"customerICO"`
	CreatedAt   time.Time `json:"createdAt"`
	IssueDate   time.Time
	// User id of invoice creator
	CreatedBy int `json:"createdBy"`
}

func (inv *Invoice) MarshalJSON() ([]byte, error) {
	type Alias Invoice
	return json.Marshal(&struct {
		*Alias
		IssueDate string `json:"issueDate"`
	}{
		Alias:     (*Alias)(inv),
		IssueDate: inv.IssueDate.Format(timeutil.DateLayoutISO),
	})
}

func (inv *Invoice) UnmarshalJSON(data []byte) error {
	type Alias Invoice
	var a = &struct {
		*Alias
		IssueDate string `json:"issueDate"`
	}{}
	err := json.Unmarshal(data, a)
	if err != nil {
		return err
	}

	issueDate, err := time.Parse(timeutil.DateLayoutISO, a.IssueDate)
	if err != nil {
		return nil
	}

	if err = copier.Copy(inv, a.Alias); err != nil {
		return err
	}

	inv.IssueDate = issueDate
	return nil
}
