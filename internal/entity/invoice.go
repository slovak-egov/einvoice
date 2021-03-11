package entity

import (
	"time"

	"github.com/slovak-egov/einvoice/pkg/timeutil"
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
	Id                  int           `json:"id"`
	Sender              string        `json:"sender"`
	Receiver            string        `json:"receiver"`
	Format              string        `json:"format"`
	Amount              float64       `json:"amount"`
	AmountWithoutVat    float64       `json:"amountWithoutVat"`
	SupplierIco         string        `json:"supplierIco"`
	SupplierCountry     string        `json:"-" pg:"-"`
	CustomerIco         string        `json:"customerIco"`
	CustomerCountry     string        `json:"-" pg:"-"`
	CreatedAt           time.Time     `json:"createdAt"`
	IssueDate           timeutil.Date `json:"issueDate"`
	CreatedBy           int           `json:"createdBy"` // User id of invoice creator
	Test                bool          `json:"test"`
	NotificationsStatus string        `json:"notificationsStatus"`
}

func (invoice *Invoice) GetInvoicePartiesType() string {
	if invoice.SupplierCountry == Slovakia && invoice.CustomerCountry == Slovakia {
		return SlovakInvoiceParties
	} else if invoice.SupplierCountry != Slovakia {
		return ForeignSupplierParty
	} else {
		return ForeignCustomerParty
	}
}
