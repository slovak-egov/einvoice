package ubl21

type Invoice struct {
	ID                      string
	AccountingSupplierParty AccountingSupplierParty
	AccountingCustomerParty AccountingCustomerParty
	LegalMonetaryTotal      MonetaryTotalType
}

type AccountingSupplierParty struct {
	Party *Party
}

type AccountingCustomerParty struct {
	Party *Party
}

type Party struct {
	PartyIdentification []PartyIdentification
	PartyName           []PartyName
	PartyTaxScheme      []PartyTaxScheme
}

type PartyTaxScheme struct {
	CompanyID *CompanyID
}

type CompanyID struct {
	Value    string  `xml:",innerxml"`
	SchemeID *string `xml:"schemeID,attr"`
}

type PartyIdentification struct {
	ID ID
}

type ID struct {
	Value    string  `xml:",innerxml"`
	SchemeID *string `xml:"schemeID,attr"`
}

type PartyName struct {
	Name string
}

type MonetaryTotalType struct {
	PayableAmount PayableAmountType
}

type PayableAmountType struct {
	Value string `xml:",innerxml"`
}
