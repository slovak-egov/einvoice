package metadataExtractor

type ublInvoice struct {
	IssueDate               string
	AccountingSupplierParty struct {
		Party ublParty
	}
	AccountingCustomerParty struct {
		Party ublParty
	}
	LegalMonetaryTotal struct {
		TaxExclusiveAmount amount
		TaxInclusiveAmount amount
	}
}

type amount struct {
	Value      float64 `xml:",chardata"`
	CurrencyID string  `xml:"currencyID,attr"`
}

type ublParty struct {
	PartyIdentification struct {
		ID string
	}
	PartyName struct {
		Name string
	}
	PostalAddress struct {
		Country struct {
			IdentificationCode string
		}
	}
}
