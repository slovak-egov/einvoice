package metadataExtractor

type d16bInvoice struct {
	ExchangedDocument struct {
		IssueDateTime struct {
			DateTimeString string
		}
	}
	SupplyChainTradeTransaction struct {
		ApplicableHeaderTradeAgreement struct {
			SellerTradeParty d16bParty
			BuyerTradeParty  d16bParty
		}
		ApplicableHeaderTradeSettlement struct {
			SpecifiedTradeSettlementHeaderMonetarySummation struct {
				DuePayableAmount float64
			}
		}
	}
}

type d16bParty struct {
	ID   string
	Name string
}
