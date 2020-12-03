package ubl21

type Invoice struct {
	ID                      string
	IssueDate               string
	AccountingSupplierParty struct {
		Party *Party
	}
	AccountingCustomerParty struct {
		Party *Party
	}
	LegalMonetaryTotal struct {
		PayableAmount struct {
			Value string `xml:",innerxml"`
		}
	}
}

type Party struct {
	PartyIdentification []struct {
		ID ID
	}
	PartyName []struct {
		Name string
	}
	PostalAddress  *AddressType
	PartyTaxScheme []struct {
		CompanyID *CompanyID
	}
}

type AddressType struct {
	Postbox              *string
	Floor                *string
	Room                 *string
	StreetName           *string
	AdditionalStreetName *string
	BlockName            *string
	BuildingName         *string
	BuildingNumber       *string
	InhouseMail          *string
	Department           *string
	MarkAttention        *string
	MarkCare             *string
	PlotIdentification   *string
	CitySubdivisionName  *string
	CityName             *string
	PostalZone           *string
	CountrySubentity     *string
	Region               *string
	District             *string
	AddressLine          []struct {
		Line string
	}
	Country *struct {
		IdentificationCode *string
		Name               *string
	}
}

type CompanyID struct {
	Value    string  `xml:",innerxml"`
	SchemeID *string `xml:"schemeID,attr"`
}

type ID struct {
	Value    string  `xml:",innerxml"`
	SchemeID *string `xml:"schemeID,attr"`
}
