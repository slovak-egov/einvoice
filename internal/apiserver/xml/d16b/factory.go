package d16b

import (
	"encoding/xml"
	"strconv"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func Create(value []byte) (*entity.Invoice, error) {
	inv := &CrossIndustryInvoice{}
	err := xml.Unmarshal(value, &inv)
	if err != nil {
		return nil, err
	}

	customer := parseParty(inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty)
	supplier := parseParty(inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty)

	issueDate, err := getIssueDate(inv.ExchangedDocument.IssueDateTime)
	if err != nil {
		return nil, err
	}

	return &entity.Invoice{
		Sender:      supplier.name,
		Receiver:    customer.name,
		Format:      entity.D16bFormat,
		Price:       getPrice(inv),
		CustomerIco: customer.ico,
		SupplierIco: supplier.ico,
		IssueDate:   *issueDate,
	}, nil
}

type partyInfo struct {
	ico, name string
}

func parseParty(party *TradePartyType) partyInfo {
	if party == nil {
		return partyInfo{}
	}

	return partyInfo{
		ico:  getIco(party),
		name: *party.Name,
	}
}

func getPrice(inv *CrossIndustryInvoice) (sum float64) {
	if inv == nil {
		return
	}

	summation := inv.SupplyChainTradeTransaction.ApplicableHeaderTradeSettlement.SpecifiedTradeSettlementHeaderMonetarySummation
	if summation == nil {
		return
	}

	for _, l := range summation.LineTotalAmount {
		price, parsingErr := strconv.ParseFloat(l.Value, 64)
		if parsingErr != nil {
			return
		}
		sum += price
	}

	return
}

func getIco(party *TradePartyType) (ico string) {
	for _, id := range party.ID {

		if id.SchemeID == nil || *id.SchemeID != "0158" {
			continue
		}
		if ico != "" {
			return ""
		}
		ico = id.Value
	}

	return ico
}

func getIssueDate(date DateTimeType) (*timeutil.Date, error) {
	if d := date.DateTimeString; d != nil {
		t, err := timeutil.ParseDate(d.Value, timeutil.D16bDateLayout)
		if err != nil {
			return nil, err
		}
		return t, nil
	}
	return nil, nil
}
