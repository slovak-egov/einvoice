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
	invoice := &ublInvoice{}
	err := xml.Unmarshal(rawInvoice, &invoice)
	if err != nil {
		return nil, err
	}

	issueDate, err := timeutil.ParseDate(invoice.IssueDate, timeutil.DateLayoutISO)
	if err != nil {
		return nil, err
	}

	return &entity.Invoice{
		Format:           entity.UblFormat,
		Sender:           invoice.AccountingSupplierParty.Party.PartyName.Name,
		SupplierIco:      invoice.AccountingSupplierParty.Party.PartyIdentification.ID,
		Receiver:         invoice.AccountingCustomerParty.Party.PartyName.Name,
		CustomerIco:      invoice.AccountingCustomerParty.Party.PartyIdentification.ID,
		Amount:           invoice.LegalMonetaryTotal.TaxInclusiveAmount,
		AmountWithoutVat: invoice.LegalMonetaryTotal.TaxExclusiveAmount,
		IssueDate:        *issueDate,
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
		Format:           entity.D16bFormat,
		Sender:           invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty.Name,
		SupplierIco:      invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.SellerTradeParty.ID,
		Receiver:         invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty.Name,
		CustomerIco:      invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeAgreement.BuyerTradeParty.ID,
		Amount:           invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeSettlement.SpecifiedTradeSettlementHeaderMonetarySummation.GrandTotalAmount,
		AmountWithoutVat: invoice.SupplyChainTradeTransaction.ApplicableHeaderTradeSettlement.SpecifiedTradeSettlementHeaderMonetarySummation.TaxBasisTotalAmount,
		IssueDate:        *issueDate,
	}, nil
}
