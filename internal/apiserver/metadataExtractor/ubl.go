package metadataExtractor

type ublInvoice struct {
	IssueDate string
	AccountingSupplierParty struct {
		Party ublParty
	}
	AccountingCustomerParty struct {
		Party ublParty
	}
	LegalMonetaryTotal struct {
		PayableAmount float64
	}
}

type ublParty struct {
	PartyIdentification struct {
		ID string
	}
	PartyName struct {
		Name string
	}
}
