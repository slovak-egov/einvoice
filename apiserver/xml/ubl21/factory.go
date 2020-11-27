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

	var errs []string

	customer, validationErrs := parseParty("customer", inv.AccountingCustomerParty.Party)
	if len(validationErrs) != 0 {
		errs = append(errs, validationErrs...)
	}

	supplier, validationErrs := parseParty("supplier", inv.AccountingSupplierParty.Party)
	if len(validationErrs) != 0 {
		errs = append(errs, validationErrs...)
	}

	price, err := strconv.ParseFloat(inv.LegalMonetaryTotal.PayableAmount.Value, 64)
	if err != nil {
		errs = append(errs, "price.parsingError")
	}

	if len(errs) > 0 {
		return nil, errors.New(strings.Join(errs, ", "))
	}

	return &entity.Invoice{
		Sender:      supplier.name,
		Receiver:    customer.name,
		Format:      entity.UblFormat,
		CustomerICO: customer.ico,
		SupplierICO: supplier.ico,
		Price:       price,
	}, nil
}

type partyInfo struct {
	ico, name string
}

func parseParty(partyName string, party *Party) (res partyInfo, errs []string) {
	if party == nil {
		errs = []string{partyName + ".undefined"}
		return
	}

	if name := getPartyName(party); name == "" {
		errs = append(errs, "name.undefined")
	} else {
		res.name = name
	}

	if ico, icoErr := getICO(party); icoErr != "" {
		errs = append(errs, icoErr)
	} else {
		res.ico = ico
	}

	if address := party.PostalAddress; address == nil {
		errs = append(errs, "address.undefined")
	} else {
		// TODO: define required fields, everything can be unstructured in array of AddressLines

		if address.Country == nil {
			errs = append(errs, "address.country.undefined")
		}

		if address.CityName == nil {
			errs = append(errs, "address.city.undefined")
		}
	}

	for i := range errs {
		errs[i] = partyName + "." + errs[i]
	}
	return
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

func getICO(party *Party) (ico string, err string) {
	for _, identification := range party.PartyIdentification {
		if identification.ID.SchemeID == nil || *identification.ID.SchemeID != "0158" {
			continue
		}
		if ico != "" {
			err = "ico.multiple"
			return
		}
		ico = identification.ID.Value
	}

	if ico == "" {
		err = "ico.undefined"
		return
	}

	return ico, ""
}
