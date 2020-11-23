package d16b

type CrossIndustryInvoice struct {
	SupplyChainTradeTransaction SupplyChainTradeTransaction
}

type SupplyChainTradeTransaction struct {
	ApplicableHeaderTradeAgreement  HeaderTradeAgreementType
	ApplicableHeaderTradeSettlement HeaderTradeSettlementType
}

type HeaderTradeAgreementType struct {
	SellerTradeParty *TradePartyType
	BuyerTradeParty  *TradePartyType
}

type TradePartyType struct {
	ID                       []ID
	Name                     *string
	SpecifiedTaxRegistration []SpecifiedTaxRegistration
}

type SpecifiedTaxRegistration struct {
	ID *ID
}

type ID struct {
	SchemeID *string `xml:"schemeID,attr"`
	Value    string  `xml:",innerxml"`
}

type HeaderTradeSettlementType struct {
	SpecifiedTradeSettlementHeaderMonetarySummation *TradeSettlementHeaderMonetarySummationType
}

type TradeSettlementHeaderMonetarySummationType struct {
	LineTotalAmount []AmountType
}

type AmountType struct {
	Value string `xml:",innerxml"`
}
