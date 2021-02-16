package ubl21

import (
	"encoding/xml"
	"strconv"
	"strings"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func Create(value []byte) (*entity.Invoice, error) {
	inv := &Invoice{}
	err := xml.Unmarshal(value, &inv)
	if err != nil {
		return nil, err
	}

	customer := parseParty(inv.AccountingCustomerParty.Party)
	supplier := parseParty(inv.AccountingSupplierParty.Party)

	price, err := strconv.ParseFloat(inv.LegalMonetaryTotal.PayableAmount.Value, 64)
	if err != nil {
		return nil, err
	}

	issueDate, err := timeutil.ParseDate(inv.IssueDate, timeutil.DateLayoutISO)
	if err != nil {
		return nil, err
	}

	return &entity.Invoice{
		Sender:      supplier.name,
		Receiver:    customer.name,
		Format:      entity.UblFormat,
		CustomerIco: customer.ico,
		SupplierIco: supplier.ico,
		Price:       price,
		IssueDate:   *issueDate,
	}, nil
}

type partyInfo struct {
	ico, name string
}

func parseParty(party *Party) partyInfo {
	if party == nil {
		return partyInfo{}
	}

	return partyInfo{ico: getIco(party), name: getPartyName(party)}
}

func getPartyName(party *Party) string {
	if party == nil {
		return ""
	}

	var builder strings.Builder
	for i, name := range party.PartyName {
		if i != 0 {
			builder.WriteString(", ")
		}
		builder.WriteString(name.Name)
	}

	return builder.String()
}

func getIco(party *Party) (ico string) {
	for _, identification := range party.PartyIdentification {
		if identification.ID.SchemeID == nil || *identification.ID.SchemeID != "0158" {
			continue
		}
		if ico != "" {
			return ""
		}
		ico = identification.ID.Value
	}

	return ico
}
