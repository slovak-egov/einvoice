package metadataExtractor

import (
	"encoding/xml"

	"github.com/slovak-egov/einvoice/internal/entity"
	"github.com/slovak-egov/einvoice/pkg/handlerutil"
	"github.com/slovak-egov/einvoice/pkg/timeutil"
)

func ParseInvoice(invoice []byte, format string) (*entity.Invoice, error) {
	switch format {
	case entity.UblFormat:
		return parseUblInvoice(invoice)
	case entity.D16bFormat:
		return parseD16bInvoice(invoice)
	default:
		return nil, handlerutil.NewBadRequestError("invoice.format.unknown")
	}
}

func parseUblInvoice(rawInvoice []byte) (*entity.Invoice, error) {
	invoice := &UblInvoice{}
	err := xml.Unmarshal(rawInvoice, &invoice)
	if err != nil {
		return nil, err
	}

	issueDate, err := timeutil.ParseDate(invoice.IssueDate, timeutil.DateLayoutISO)
	if err != nil {
		return nil, err
	}

	return &entity.Invoice{
		Format:                   entity.UblFormat,
		Sender:                   invoice.AccountingSupplierParty.Party.PartyLegalEntity.RegistrationName,
		SupplierIco:              invoice.AccountingSupplierParty.Party.PartyIdentification.ID,
		SupplierCountry:          invoice.AccountingSupplierParty.Party.PostalAddress.Country.IdentificationCode,
		Receiver:                 invoice.AccountingCustomerParty.Party.PartyLegalEntity.RegistrationName,
		CustomerIco:              invoice.AccountingCustomerParty.Party.PartyIdentification.ID,
		CustomerCountry:          invoice.AccountingCustomerParty.Party.PostalAddress.Country.IdentificationCode,
		Amount:                   invoice.LegalMonetaryTotal.TaxInclusiveAmount.Value,
		AmountCurrency:           invoice.LegalMonetaryTotal.TaxInclusiveAmount.CurrencyID,
		AmountWithoutVat:         invoice.LegalMonetaryTotal.TaxExclusiveAmount.Value,
		AmountWithoutVatCurrency: invoice.LegalMonetaryTotal.TaxExclusiveAmount.CurrencyID,
		IssueDate:                *issueDate,
	}, nil
}

func parseD16bInvoice(rawInvoice []byte) (*entity.Invoice, error) {
	invoice := &d16bInvoice{}
	err := xml.Unmarshal(rawInvoice, &invoice)
	if err != nil {
		return nil, err
	}

	issueDate, err := timeutil.ParseDate(
		invoice.ExchangedDocument.IssueDateTime.DateTimeString,
		timeutil.D16bDateLayout,
	)
	if err != nil {
		return nil, err
	}

	return &entity.Invoice{
		Format:                   entity.D16bFormat,
		Sender:                   invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty.Name,
		SupplierIco:              invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty.ID,
		SupplierCountry:          invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty.PostalTradeAddress.CountryID,
		Receiver:                 invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty.Name,
		CustomerIco:              invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty.ID,
		CustomerCountry:          invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty.PostalTradeAddress.CountryID,
		Amount:                   invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeSettlement.SpecifiedTradeSettlementHeaderMonetarySummation.GrandTotalAmount,
		AmountCurrency:           invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeSettlement.InvoiceCurrencyCode,
		AmountWithoutVat:         invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeSettlement.SpecifiedTradeSettlementHeaderMonetarySummation.TaxBasisTotalAmount,
		AmountWithoutVatCurrency: invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeSettlement.InvoiceCurrencyCode,
		IssueDate:                *issueDate,
	}, nil
}
