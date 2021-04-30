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

const generateSimpleInvoice = (data) => {
  const vat = parseInt(data.amount, 10) - parseInt(data.amountWithoutVat, 10)

  return `<?xml version="1.0" encoding="UTF-8"?>
  <Invoice
        xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
        xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
        xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">

    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
    <cbc:ID>${data.id}</cbc:ID>
    <cbc:IssueDate>${data.issueDate}</cbc:IssueDate>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>${data.currency}</cbc:DocumentCurrencyCode>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID>${data.supplierIco}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PostalAddress>
                <cac:Country>
                    <cbc:IdentificationCode>${data.supplierCountry}</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${data.supplierVat}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${data.supplierName}</cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID>${data.customerIco}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PostalAddress>
                <cac:Country>
                    <cbc:IdentificationCode>${data.customerCountry}</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${data.supplierName}</cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingCustomerParty>
    <cac:PaymentTerms>
        <cbc:Note>.</cbc:Note>
    </cac:PaymentTerms>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${data.currency}">${vat}</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="${data.currency}">${data.amountWithoutVat}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="${data.currency}">${vat}</cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>${data.productTaxPercentage}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="${data.currency}">${data.amountWithoutVat}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="${data.currency}">${data.amountWithoutVat}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="${data.currency}">${data.amount}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="${data.currency}">${data.amount}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    <cac:InvoiceLine>
        <cbc:ID>1</cbc:ID>
        <cbc:InvoicedQuantity unitCode="${data.quantityUnit}">${data.quantity}</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="${data.currency}">${data.amountWithoutVat}</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Name>${data.productName}</cbc:Name>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>${data.productTaxPercentage}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="${data.currency}">${data.quantityUnitPrice}</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
</Invoice>`
}

const generateSimpleCreditNote = (data) => {
  const vat = parseInt(data.amount, 10) - parseInt(data.amountWithoutVat, 10)

  return `<?xml version="1.0" encoding="UTF-8"?>
  <CreditNote
        xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
        xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
        xmlns="urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2">

    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
    <cbc:ID>${data.id}</cbc:ID>
    <cbc:IssueDate>${data.issueDate}</cbc:IssueDate>
    <cbc:CreditNoteTypeCode>381</cbc:CreditNoteTypeCode>
    <cbc:DocumentCurrencyCode>${data.currency}</cbc:DocumentCurrencyCode>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID>${data.supplierIco}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PostalAddress>
                <cac:Country>
                    <cbc:IdentificationCode>${data.supplierCountry}</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>${data.supplierVat}</cbc:CompanyID>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:PartyTaxScheme>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${data.supplierName}</cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID>${data.customerIco}</cbc:ID>
            </cac:PartyIdentification>
            <cac:PostalAddress>
                <cac:Country>
                    <cbc:IdentificationCode>${data.customerCountry}</cbc:IdentificationCode>
                </cac:Country>
            </cac:PostalAddress>
            <cac:PartyLegalEntity>
                <cbc:RegistrationName>${data.supplierName}</cbc:RegistrationName>
            </cac:PartyLegalEntity>
        </cac:Party>
    </cac:AccountingCustomerParty>
    <cac:PaymentTerms>
        <cbc:Note>.</cbc:Note>
    </cac:PaymentTerms>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${data.currency}">${vat}</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="${data.currency}">${data.amountWithoutVat}</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="${data.currency}">${vat}</cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>${data.productTaxPercentage}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="${data.currency}">${data.amountWithoutVat}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="${data.currency}">${data.amountWithoutVat}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="${data.currency}">${data.amount}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="${data.currency}">${data.amount}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    <cac:CreditNoteLine>
        <cbc:ID>1</cbc:ID>
        <cbc:CreditedQuantity unitCode="${data.quantityUnit}">${data.quantity}</cbc:CreditedQuantity>
        <cbc:LineExtensionAmount currencyID="${data.currency}">${data.amountWithoutVat}</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Name>${data.productName}</cbc:Name>
            <cac:ClassifiedTaxCategory>
                <cbc:ID>S</cbc:ID>
                <cbc:Percent>${data.productTaxPercentage}</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>VAT</cbc:ID>
                </cac:TaxScheme>
            </cac:ClassifiedTaxCategory>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="${data.currency}">${data.quantityUnitPrice}</cbc:PriceAmount>
        </cac:Price>
    </cac:CreditNoteLine>
</CreditNote>`
}

export const generateInvoice = async (formData, invoiceType, invoiceComplexity) => {
  if (invoiceComplexity === invoiceComplexities.SIMPLE) {
    if (invoiceType === invoiceTypes.INVOICE) return generateSimpleInvoice(formData)
    else return generateSimpleCreditNote(formData)
  }
  const invoice = await generateInvoiceXml(
    capitalizeFirstChar(invoiceType), formData, 0, rootAttributes(invoiceType),
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n${invoice}`
}
