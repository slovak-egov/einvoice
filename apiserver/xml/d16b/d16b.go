package d16b

type CrossIndustryInvoice struct {
	ExchangedDocument struct {
		IssueDateTime DateTimeType
	}
	SupplyChainTradeTransaction struct {
		ApplicableHeaderTradeAgreement struct {
			SellerTradeParty *TradePartyType
			BuyerTradeParty  *TradePartyType
		}
		ApplicableHeaderTradeSettlement struct {
			SpecifiedTradeSettlementHeaderMonetarySummation *struct {
				LineTotalAmount []AmountType
			}
		}
	}
}

type DateTimeType struct {
	DateTimeString *struct {
		Format *string `xml:"format,attr"`
		Value  string  `xml:",innerxml"`
	}
	DateTime *struct {
		Value string `xml:",innerxml"`
	}
}

type TradePartyType struct {
	ID                       []ID
	Name                     *string
	PostalTradeAddress       *TradeAddressType
	SpecifiedTaxRegistration []struct {
		ID *ID
	}
}

type TradeAddressType struct {
	PostcodeCode           *string
	PostOfficeBox          *string
	BuildingName           *string
	LineOne                *string
	LineTwo                *string
	LineThree              *string
	LineFour               *string
	LineFive               *string
	StreetName             *string
	CityName               *string
	CountryID              *string
	CountryName            []string
	CountrySubDivisionID   *string
	CountrySubDivisionName []string
	AttentionOf            *string
	CareOf                 *string
	BuildingNumber         *string
	DepartmentName         *string
	AdditionalStreetName   *string
}

type ID struct {
	SchemeID *string `xml:"schemeID,attr"`
	Value    string  `xml:",innerxml"`
}

type AmountType struct {
	Value string `xml:",innerxml"`
}
