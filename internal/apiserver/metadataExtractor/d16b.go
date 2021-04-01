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
			InvoiceCurrencyCode                             string
			SpecifiedTradeSettlementHeaderMonetarySummation struct {
				GrandTotalAmount    float64
				TaxBasisTotalAmount float64
			}
		}
	}
}

type d16bParty struct {
	ID                 string
	Name               string
	PostalTradeAddress struct {
		CountryID string
	}
}
