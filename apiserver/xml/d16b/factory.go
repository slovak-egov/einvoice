package d16b

import (
	"encoding/xml"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/slovak-egov/einvoice/apiserver/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func Create(value []byte) (*entity.Invoice, error) {
	inv := &CrossIndustryInvoice{}
	err := xml.Unmarshal(value, &inv)
	if err != nil {
		return nil, err
	}

	var errs []string

	customer, validationErrs := parseParty("customer", inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty)
	if len(validationErrs) != 0 {
		errs = append(errs, validationErrs...)
	}

	supplier, validationErrs := parseParty("supplier", inv.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty)
	if len(validationErrs) != 0 {
		errs = append(errs, validationErrs...)
	}

	price, validationErr := getPrice(inv)
	if validationErr != "" {
		errs = append(errs, validationErr)
	}

	issueDate, validationErr := getIssueDate(inv.ExchangedDocument.IssueDateTime)
	if validationErr != "" {
		errs = append(errs, validationErr)
	}

	if len(errs) > 0 {
		return nil, errors.New(strings.Join(errs, ", "))
	}

	return &entity.Invoice{
		Sender:      supplier.name,
		Receiver:    customer.name,
		Format:      entity.D16bFormat,
		Price:       price,
		CustomerICO: customer.ico,
		SupplierICO: supplier.ico,
		IssueDate:   *issueDate,
	}, nil
}

type partyInfo struct {
	ico, name string
}

func parseParty(partyName string, party *TradePartyType) (res partyInfo, errs []string) {
	if party == nil {
		errs = []string{partyName + ".undefined"}
		return
	}

	if party.Name == nil {
		errs = append(errs, "name.undefined")
	} else {
		res.name = *party.Name
	}

	if address := party.PostalTradeAddress; address == nil {
		errs = append(errs, "address.undefined")
	} else {
		if address.CountryID == nil && len(address.CountryName) == 0 {
			errs = append(errs, "address.country.undefined")
		}

		if address.CityName == nil {
			errs = append(errs, "address.city.undefined")
		}

		if address.BuildingNumber == nil {
			errs = append(errs, "address.building.number.undefined")
		}
	}

	ico, icoErr := getICO(party)
	if icoErr != "" {
		errs = append(errs, icoErr)
	} else {
		res.ico = ico
	}

	for i := range errs {
		errs[i] = partyName + "." + errs[i]
	}
	return
}

func getPrice(inv *CrossIndustryInvoice) (sum float64, err string) {
	if inv == nil {
		return
	}

	summation := inv.SupplyChainTradeTransaction.ApplicableHeaderTradeSettlement.SpecifiedTradeSettlementHeaderMonetarySummation
	if summation == nil {
		err = "price.undefined"
		return
	}

	for _, l := range summation.LineTotalAmount {
		price, parsingErr := strconv.ParseFloat(l.Value, 64)
		if parsingErr != nil {
			err = "price.value.parsingError"
			return
		}
		sum += price
	}

	return
}

func getICO(party *TradePartyType) (ico string, err string) {
	for _, id := range party.ID {

		if id.SchemeID == nil || *id.SchemeID != "0158" {
			continue
		}
		if ico != "" {
			return "", "ico.multiple"
		}
		ico = id.Value
	}

	if ico == "" {
		return "", "ico.undefined"
	}

	return ico, ""
}

func getIssueDate(date DateTimeType) (*time.Time, string) {
	// TODO: parse other formats
	if d := date.DateTime; d != nil {
		t, err := time.Parse(timeutil.DateLayoutISO, d.Value)
		if err != nil {
			return nil, "issueDate.parsingError"
		}
		return &t, ""
	}
	if d := date.DateTimeString; d != nil {
		t, err := time.Parse(timeutil.DateLayoutISO, d.Value)
		if err != nil {
			return nil, "issueDate.parsingError"
		}
		return &t, ""
	}
	return nil, "issueDate.undefined"
}
