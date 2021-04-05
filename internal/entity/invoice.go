package entity

import (
	"time"

	"github.com/slovak-egov/einvoice/pkg/timeutil"
	"github.com/slovak-egov/einvoice/pkg/ulid"
)

const (
	UblFormat  = "ubl2.1"
	D16bFormat = "d16b"

	NotificationStatusNotSent = "not_sent"
	NotificationStatusSent    = "sent"
	NotificationStatusSending = "sending"

	SlovakInvoiceParties = "slovakParties"
	ForeignSupplierParty = "foreignSupplier"
	ForeignCustomerParty = "foreignCustomer"

	InvoiceDocumentType    = "invoice"
	CreditNoteDocumentType = "creditNote"

	Slovakia = "SK"
)

var InvoiceFormats = []string{UblFormat, D16bFormat}
var InvoicePartiesTypes = []string{SlovakInvoiceParties, ForeignSupplierParty, ForeignCustomerParty}
var DocumentTypes = []string{InvoiceDocumentType, CreditNoteDocumentType}

type Invoice struct {
	Id                       string        `json:"id"`
	CreatedAt                *time.Time    `json:"createdAt,omitempty" pg:"-"`
	Sender                   string        `json:"sender"`
	Receiver                 string        `json:"receiver"`
	Format                   string        `json:"format"`
	Amount                   float64       `json:"amount"`
	AmountCurrency           string        `json:"amountCurrency"`
	AmountWithoutVat         float64       `json:"amountWithoutVat"`
	AmountWithoutVatCurrency string        `json:"amountWithoutVatCurrency"`
	SupplierIco              string        `json:"supplierIco"`
	SupplierCountry          string        `json:"-" pg:"-"`
	CustomerIco              string        `json:"customerIco"`
	CustomerCountry          string        `json:"-" pg:"-"`
	IssueDate                timeutil.Date `json:"issueDate"`
	CreatedBy                int           `json:"createdBy"` // User id of invoice creator
	Test                     bool          `json:"test"`
	NotificationsStatus      string        `json:"notificationsStatus"`
}

// Derive created at from id
func (i *Invoice) CalculateCreatedAt() {
	parsedId, err := ulid.Parse(i.Id)
	if err != nil {
		panic(err)
	}
	createdAt := parsedId.Time()
	i.CreatedAt = &createdAt
}

func (i *Invoice) GetInvoicePartiesType() string {
	if i.SupplierCountry == Slovakia && i.CustomerCountry == Slovakia {
		return SlovakInvoiceParties
	} else if i.SupplierCountry != Slovakia {
		return ForeignSupplierParty
	} else {
		return ForeignCustomerParty
	}
}
