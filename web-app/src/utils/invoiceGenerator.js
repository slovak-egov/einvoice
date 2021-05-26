import {isEmpty} from 'lodash'
import {capitalizeFirstChar} from './helpers'
import {invoiceComplexities, invoiceTypes, rootAttributes} from './constants'

const generateInvoiceXml = async (name, data, indent, additionalAttributes) => {
  let openingTag = `${' '.repeat(indent)}<${name}>`
  const attributes = {
    ...data.attributes,
    ...additionalAttributes,
  }
  if (!isEmpty(attributes)) {
    // Filter attributes that were not set
    const setAttributes = Object.entries(attributes).filter(([k, v]) => v.length > 0)
    const attributesString = setAttributes.map(([k, v]) => `${k}="${v[0].text}"`).join(' ')
    openingTag = `${openingTag.slice(0, -1)} ${attributesString}>`
  }

  // Text inside of tag
  if (data.text != null) {
    return `${openingTag}${data.text}</${name}>`
  }

  const rows = [openingTag]
  if (data.children != null) {
    for (const [name, childArr] of Object.entries(data.children)) {
      for (const child of childArr) {
        rows.push(await generateInvoiceXml(name, child, indent + 2))
      }
    }
  }

  rows.push(`${' '.repeat(indent)}</${name}>`)

  return rows.join('\n')
}

function formatXml(xml) {
  const tab = '\t'
  let formatted = ''
  let indent = ''
  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length)
    formatted += `${indent}<${node}>\n`
    if (node.match(/^<?\w[^>]*[^/]$/)) indent += tab
  })
  return formatted.substring(1, formatted.length - 2)
}

const generateOrderReference = (ref) => ref ?
  `<cac:OrderReference>
      <cbc:ID>${ref}</cbc:ID>
  </cac:OrderReference>`
  : ''

const generatePreviousInvoiceReference = (ref) => ref ?
  `<cac:BillingReference>
      <cac:InvoiceDocumentReference>
          <cbc:ID>${ref}</cbc:ID>
      </cac:InvoiceDocumentReference>
  </cac:BillingReference>`
  : ''

const generateOriginatorReference = (ref) => ref ?
  `<cac:OriginatorDocumentReference>
      <cbc:ID>${ref}</cbc:ID>
  </cac:OriginatorDocumentReference>`
  : ''

const generateAddress = (address, name) => `<${name}>
    <cbc:StreetName>${address.addressLine1}</cbc:StreetName>
    <cbc:CityName>${address.city}</cbc:CityName>
    <cbc:PostalZone>${address.postalZone}</cbc:PostalZone>
    <cac:Country>
        <cbc:IdentificationCode>${address.country}</cbc:IdentificationCode>
    </cac:Country>
  </${name}>`

const generateParty = (party) => `<cac:Party>
    <cac:PartyIdentification>
        <cbc:ID>${party.ico}</cbc:ID>
    </cac:PartyIdentification>
    ${party.businessName ?
    `<cac:PartyName>
        <cbc:Name>${party.businessName}</cbc:Name>
    </cac:PartyName>`
    : ''}
    ${generateAddress(party.address, 'cac:PostalAddress')}
    <cac:PartyTaxScheme>
        <cbc:CompanyID>${party.vatId}</cbc:CompanyID>
        <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
    </cac:PartyTaxScheme>
    <cac:PartyLegalEntity>
        <cbc:RegistrationName>${party.name}</cbc:RegistrationName>
    </cac:PartyLegalEntity>
    <cac:Contact>
        <cbc:Name>${party.contactName}</cbc:Name>
        <cbc:Telephone>${party.contactPhone}</cbc:Telephone>
        <cbc:ElectronicMail>${party.contactEmail}</cbc:ElectronicMail>
    </cac:Contact>
  </cac:Party>`

const generateTaxSubtotal = (item, currency) =>
  `<cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currency}">${item.amountWithoutVat}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currency}">${item.vat}</cbc:TaxAmount>
        <cac:TaxCategory>
            <cbc:ID>${item.taxCategory}</cbc:ID>
            <cbc:Percent>${item.taxPercentage}</cbc:Percent>
            ${item.taxExemptionCode ? `<cbc:TaxExemptionReasonCode>${item.taxExemptionCode}</cbc:TaxExemptionReasonCode>` : ''}
            ${item.taxExemptionReason ? `<cbc:TaxExemptionReason>${item.taxExemptionReason}</cbc:TaxExemptionReason>` : ''}
            <cac:TaxScheme>
                <cbc:ID>VAT</cbc:ID>
            </cac:TaxScheme>
        </cac:TaxCategory>
    </cac:TaxSubtotal>`

const generateItem = (item, name, quantityName, currency) =>
  `<${name}>
        <cbc:ID>${item.id}</cbc:ID>
        ${item.note ? `<cbc:Note>${item.note}</cbc:Note>` : ''}
        <${quantityName} unitCode="${item.unit}">${item.quantity}</${quantityName}>
        <cbc:LineExtensionAmount currencyID="${currency}">${item.amountWithoutVat}</cbc:LineExtensionAmount>
        ${item.accountingCost ? `<cbc:AccountingCost>${item.accountingCost}</cbc:AccountingCost>` : ''}
        <cac:Item>
            ${item.description ? `<cbc:Description>${item.description}</cbc:Description>` : ''}
            <cbc:Name>${item.name}</cbc:Name>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>${item.taxCategory}</cbc:ID>
                <cbc:Percent>${item.taxPercentage}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="${currency}">${item.quantityUnitPrice}</cbc:PriceAmount>
        </cac:Price>
    </${name}>`

const generateSimpleInvoice = (invoice) => `<?xml version="1.0" encoding="UTF-8"?>
  <Invoice
        xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
        xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
        xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">

    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
    <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
    <cbc:IssueDate>${invoice.issueDate}</cbc:IssueDate>
    <cbc:DueDate>${invoice.dueDate}</cbc:DueDate>
    <cbc:InvoiceTypeCode>${invoice.invoiceTypeCode}</cbc:InvoiceTypeCode>
    ${invoice.note ? `<cbc:Note>${invoice.note}</cbc:Note>` : ''}
    <cbc:TaxPointDate>${invoice.taxPointDate}</cbc:TaxPointDate>
    <cbc:DocumentCurrencyCode>${invoice.currencyCode}</cbc:DocumentCurrencyCode>
    ${generateOrderReference(invoice.orderReference)}
    ${generatePreviousInvoiceReference(invoice.previousInvoiceNumber)}
    ${generateOriginatorReference(invoice.originatorDocumentId)}
    <cac:AccountingSupplierParty>
        ${generateParty(invoice.supplier)}
    </cac:AccountingSupplierParty>
    <cac:AccountingCustomerParty>
        ${generateParty(invoice.customer)}
    </cac:AccountingCustomerParty>
    ${(invoice.deliveryDate || invoice.customer.deliveryAddress.line1) ?
    `<cac:Delivery>
        ${invoice.deliveryDate ? `<cbc:ActualDeliveryDate>${invoice.deliveryDate}</cbc:ActualDeliveryDate>` : ''}
        ${invoice.customer.deliveryAddress ?
    `<cac:DeliveryLocation>
            ${generateAddress(invoice.customer.deliveryAddress, 'cac:Address')}
        </cac:DeliveryLocation>`
    : ''}
    </cac:Delivery>`
    : ''}
    <cac:PaymentMeans>
        <cbc:PaymentMeansCode>${invoice.supplier.paymentMeansCode}</cbc:PaymentMeansCode>
        <cbc:PaymentID>${invoice.paymentId}</cbc:PaymentID>
        <cac:PayeeFinancialAccount>
            <cbc:ID>${invoice.supplier.paymentAccountId}</cbc:ID>
        </cac:PayeeFinancialAccount>
    </cac:PaymentMeans>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${invoice.currencyCode}">${invoice.vat}</cbc:TaxAmount>
        ${Object.values(invoice.items).map((item) => (generateTaxSubtotal(item, invoice.currencyCode))).join('\n')}
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="${invoice.currencyCode}">${invoice.amountWithoutVat}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="${invoice.currencyCode}">${invoice.amountWithoutVat}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="${invoice.currencyCode}">${invoice.amount}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="${invoice.currencyCode}">${invoice.amount}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    ${Object.values(invoice.items).map((item) =>
    (generateItem(item, 'cac:InvoiceLine', 'cbc:InvoicedQuantity', invoice.currencyCode)))
    .join('\n')}
</Invoice>`


const generateSimpleCreditNote = (invoice) => `<?xml version="1.0" encoding="UTF-8"?>
  <CreditNote xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
			xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
			xmlns="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2">
	<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
	<cbc:ID>${invoice.invoiceNumber}</cbc:ID>
	<cbc:IssueDate>${invoice.issueDate}</cbc:IssueDate>
	<cbc:TaxPointDate>${invoice.taxPointDate}</cbc:TaxPointDate>
	<cbc:CreditNoteTypeCode>${invoice.invoiceTypeCode}</cbc:CreditNoteTypeCode>
	${invoice.note ? `<cbc:Note>${invoice.note}</cbc:Note>` : ''}
	<cbc:DocumentCurrencyCode>${invoice.currencyCode}</cbc:DocumentCurrencyCode>
	${generateOrderReference(invoice.orderReference)}
  ${generatePreviousInvoiceReference(invoice.previousInvoiceNumber)}
  ${generateOriginatorReference(invoice.originatorDocumentId)}
	<cac:AccountingSupplierParty>
      ${generateParty(invoice.supplier)}
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
      ${generateParty(invoice.customer)}
  </cac:AccountingCustomerParty>
  ${(invoice.deliveryDate || invoice.deliveryAddress.line1) ?
    `<cac:Delivery>
        ${invoice.deliveryDate ? `<cbc:ActualDeliveryDate>${invoice.deliveryDate}</cbc:ActualDeliveryDate>` : ''}
        ${invoice.deliveryAddress ?
    `<cac:DeliveryLocation>
            ${generateAddress(invoice.deliveryAddress, 'cac:Address')}
        </cac:DeliveryLocation>`
    : ''}
    </cac:Delivery>`
    : ''}
  <cac:PaymentMeans>
      <cbc:PaymentMeansCode>${invoice.supplier.paymentMeansCode}</cbc:PaymentMeansCode>
      ${invoice.dueDate ? `<cbc:PaymentDueDate>${invoice.dueDate}</cbc:PaymentDueDate>` : ''}
      <cbc:PaymentID>${invoice.paymentId}</cbc:PaymentID>
      <cac:PayeeFinancialAccount>
          <cbc:ID>${invoice.supplier.paymentAccountId}</cbc:ID>
      </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
	<cac:TaxTotal>
      <cbc:TaxAmount currencyID="${invoice.currencyCode}">${invoice.vat}</cbc:TaxAmount>
      ${Object.values(invoice.items).map((item) => (generateTaxSubtotal(item, invoice.currencyCode))).join('\n')}
  </cac:TaxTotal>
	<cac:LegalMonetaryTotal>
      <cbc:LineExtensionAmount currencyID="${invoice.currencyCode}">${invoice.amountWithoutVat}</cbc:LineExtensionAmount>
      <cbc:TaxExclusiveAmount currencyID="${invoice.currencyCode}">${invoice.amountWithoutVat}</cbc:TaxExclusiveAmount>
      <cbc:TaxInclusiveAmount currencyID="${invoice.currencyCode}">${invoice.amount}</cbc:TaxInclusiveAmount>
      <cbc:PayableAmount currencyID="${invoice.currencyCode}">${invoice.amount}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${Object.values(invoice.items).map((item) =>
    (generateItem(item, 'cac:CreditNoteLine', 'cbc:CreditedQuantity', invoice.currencyCode)))
    .join('\n')}
</CreditNote>`

export const generateInvoice = async (formData, invoiceType, invoiceComplexity) => {
  if (invoiceComplexity === invoiceComplexities.SIMPLE) {
    if (invoiceType === invoiceTypes.INVOICE) return formatXml(generateSimpleInvoice(formData))
    else return formatXml(generateSimpleCreditNote(formData))
  }
  const invoice = await generateInvoiceXml(
    capitalizeFirstChar(invoiceType), formData, 0, rootAttributes(invoiceType),
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n${invoice}`
}
