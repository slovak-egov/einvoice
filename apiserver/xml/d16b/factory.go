package d16b

import (
	"encoding/xml"
	"errors"
	"strconv"

	"github.com/slovak-egov/einvoice/apiserver/entity"
)

func Create(value []byte) (*entity.Invoice, error) {
	inv := &CrossIndustryInvoice{}
	err := xml.Unmarshal(value, &inv)
	if err != nil {
		return nil, err
	}

	if inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty == nil {
		return nil, errors.New("Missing customer")
	}

	if inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty == nil {
		return nil, errors.New("Missing supplier")
	}

	customerICO, err := getICO(inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty)
	if err != nil {
		return nil, err
	}
	supplierICO, err := getICO(inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty)
	if err != nil {
		return nil, err
	}

	return &entity.Invoice{
		Sender:      getSenderName(inv),
		Receiver:    getReceiverName(inv),
		Format:      entity.D16bFormat,
		Price:       getPrice(inv),
		CustomerICO: customerICO,
		SupplierICO: supplierICO,
	}, nil
}

func getSenderName(inv *CrossIndustryInvoice) string {
	return getPartyName(inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty)
}

func getReceiverName(inv *CrossIndustryInvoice) string {
	return getPartyName(inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty)
}

func getPartyName(party *TradePartyType) string {
	if party == nil {
		return ""
	}
	if party.Name == nil {
		return ""
	}
	return *party.Name
}

func getPrice(inv *CrossIndustryInvoice) float64 {
	summation := inv.SupplyChainTradeTransaction.ApplicableHeaderTradeSettlement.SpecifiedTradeSettlementHeaderMonetarySummation
	if summation == nil {
		return 0
	}
	sum := .0
	for _, l := range summation.LineTotalAmount {
		price, _ := strconv.ParseFloat(l.Value, 64)
		sum += price
	}
	return sum
}

func getICO(party *TradePartyType) (string, error) {
	var ico string
	for _, id := range party.ID {

		if id.SchemeID == nil || *id.SchemeID != "0158" {
			continue
		}
		if ico != "" {
			return "", errors.New("Multiple IČO")
		}
		ico = id.Value
	}

	if ico == "" {
		return "", errors.New("Missing IČO")
	}

	return ico, nil
}
