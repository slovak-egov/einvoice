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

type UblInvoiceFull struct {
	ID                   string
	IssueDate            string
	DueDate              string
	InvoiceTypeCode      string
	Note                 string
	CreditNoteTypeCode   string
	TaxPointDate         string
	DocumentCurrencyCode string
	OrderReference       struct {
		ID string
	}
	BillingReference struct {
		InvoiceDocumentReference struct {
			ID string
		}
	}
	ContractDocumentReference struct {
		ID string
	}
	AccountingSupplierParty struct {
		Party UblParty
	}
	AccountingCustomerParty struct {
		Party UblParty
	}
	Delivery struct {
		ActualDeliveryDate string
		DeliveryLocation   struct {
			Address Address
		}
	}
	PaymentMeans struct {
		PaymentMeansCode      string
		PaymentID             string
		PaymentDueDate        string
		PayeeFinancialAccount struct {
			ID string
		}
	}
	TaxTotal struct {
		TaxAmount   float64
		TaxSubtotal []struct {
			TaxableAmount float64
			TaxAmount     float64
			TaxCategory   TaxCategory
		}
	}
	LegalMonetaryTotal struct {
		TaxExclusiveAmount Amount
		TaxInclusiveAmount Amount
		PayableAmount      Amount
	}
	InvoiceLine    []InvoiceLine
	CreditNoteLine []InvoiceLine
}

type InvoiceLine struct {
	ID                  string
	Note                string
	InvoicedQuantity    Quantity
	CreditedQuantity    Quantity
	LineExtensionAmount float64
	AccountingCost      string
	Item                struct {
		Description           string
		Name                  string
		ClassifiedTaxCategory TaxCategory
	}
	Price struct {
		PriceAmount float64
	}
}

type TaxCategory struct {
	Percent float64
}

type Quantity struct {
	Value string `xml:",chardata"`
	Code  string `xml:"unitCode,attr"`
}

type Amount struct {
	Value      float64 `xml:",chardata"`
	CurrencyID string  `xml:"currencyID,attr"`
}

type Address struct {
	StreetName string
	CityName   string
	PostalZone string
	Country    struct {
		IdentificationCode string
	}
}

type Contact struct {
	Name           string
	Telephone      string
	ElectronicMail string
}

type UblParty struct {
	PartyLegalEntity struct {
		RegistrationName string
		CompanyID        string
		CompanyLegalForm string
	}

	PostalAddress  Address
	PartyTaxScheme struct {
		CompanyID string
	}
	Contact Contact
}
