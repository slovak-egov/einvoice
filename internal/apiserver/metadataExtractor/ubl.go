package metadataExtractor

type UblInvoice struct {
	ID                      string
	IssueDate               string
	AccountingSupplierParty struct {
		Party UblParty
	}
	AccountingCustomerParty struct {
		Party UblParty
	}
	LegalMonetaryTotal struct {
		TaxExclusiveAmount Amount
		TaxInclusiveAmount Amount
	}
}

type Amount struct {
	Value      float64 `xml:",chardata"`
	CurrencyID string  `xml:"currencyID,attr"`
}

type UblParty struct {
	PartyIdentification struct {
		ID string
	}
	PartyLegalEntity struct {
		RegistrationName string
	}
	PostalAddress struct {
		Country struct {
			IdentificationCode string
		}
	}
}
