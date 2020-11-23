package ubl21

import (
	"encoding/xml"
	"errors"
	"strconv"
	"strings"

	"github.com/slovak-egov/einvoice/apiserver/entity"
)

func Create(value []byte) (*entity.Invoice, error) {
	inv := &Invoice{}
	err := xml.Unmarshal(value, &inv)
	if err != nil {
		return nil, err
	}

	if inv.AccountingCustomerParty.Party == nil {
		return nil, errors.New("Missing customer")
	}

	if inv.AccountingSupplierParty.Party == nil {
		return nil, errors.New("Missing supplier")
	}

	price, err := strconv.ParseFloat(inv.LegalMonetaryTotal.PayableAmount.Value, 64)
	if err != nil {
		return nil, err
	}

	customerICO, err := getICO(inv.AccountingCustomerParty.Party)
	if err != nil {
		return nil, err
	}

	supplierICO, err := getICO(inv.AccountingSupplierParty.Party)
	if err != nil {
		return nil, err
	}

	return &entity.Invoice{
		Sender:      getSenderName(inv),
		Receiver:    getReceiverName(inv),
		Format:      entity.UblFormat,
		CustomerICO: customerICO,
		SupplierICO: supplierICO,
		Price:       price,
	}, nil
}

func getSenderName(inv *Invoice) string {
	return getPartyName(inv.AccountingSupplierParty.Party)
}

func getReceiverName(inv *Invoice) string {
	return getPartyName(inv.AccountingCustomerParty.Party)
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

func getICO(party *Party) (string, error) {
	var ico string
	for _, identification := range party.PartyIdentification {
		if identification.ID.SchemeID == nil || *identification.ID.SchemeID != "0158" {
			continue
		}
		if ico != "" {
			return "", errors.New("Multiple ICO")
		}
		ico = identification.ID.Value
	}

	if ico == "" {
		return "", errors.New("Missing IČO")
	}

	return ico, nil
}
