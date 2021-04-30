import FormField from './Field'
import {invoiceTypes} from '../../utils/constants'

const getChildren = (docs, path) => {
  let node = docs
  path.forEach((name) => {
    if (node.children && node.children[name]) node = node.children[name]
    else node = node.attributes[name]
  })
  return node
}

const fields = {
  [invoiceTypes.INVOICE]: [
    {id: ['cbc:ID']},
    {issueDate: ['cbc:IssueDate']},
    {supplierName: ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName']},
    {supplierIco: ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyIdentification', 'cbc:ID']},
    {supplierVat: ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:CompanyID']},
    {supplierCountry: ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cac:Country', 'cbc:IdentificationCode']},
    {customerName: ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName']},
    {customerIco: ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyIdentification', 'cbc:ID']},
    {customerCountry: ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cac:Country', 'cbc:IdentificationCode']},
    {currency: ['cbc:DocumentCurrencyCode']},
    {amountWithoutVat: ['cac:LegalMonetaryTotal', 'cbc:TaxExclusiveAmount']},
    {amount: ['cac:LegalMonetaryTotal', 'cbc:TaxInclusiveAmount']},
    {productName: ['cac:InvoiceLine', 'cac:Item', 'cbc:Name']},
    {quantity: ['cac:InvoiceLine', 'cbc:InvoicedQuantity']},
    {quantityUnit: ['cac:InvoiceLine', 'cbc:InvoicedQuantity', 'unitCode']},
    {quantityUnitPrice: ['cac:InvoiceLine', 'cac:Price', 'cbc:PriceAmount']},
    {productTaxPercentage: ['cac:InvoiceLine', 'cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:Percent']},
  ],
  [invoiceTypes.CREDIT_NOTE]: [
    {id: ['cbc:ID']},
    {issueDate: ['cbc:IssueDate']},
    {supplierName: ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName']},
    {supplierIco: ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyIdentification', 'cbc:ID']},
    {supplierVat: ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:CompanyID']},
    {supplierCountry: ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cac:Country', 'cbc:IdentificationCode']},
    {customerName: ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName']},
    {customerIco: ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyIdentification', 'cbc:ID']},
    {customerCountry: ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cac:Country', 'cbc:IdentificationCode']},
    {currency: ['cbc:DocumentCurrencyCode']},
    {amountWithoutVat: ['cac:LegalMonetaryTotal', 'cbc:TaxExclusiveAmount']},
    {amount: ['cac:LegalMonetaryTotal', 'cbc:TaxInclusiveAmount']},
    {productName: ['cac:CreditNoteLine', 'cac:Item', 'cbc:Name']},
    {quantity: ['cac:CreditNoteLine', 'cbc:CreditedQuantity']},
    {quantityUnit: ['cac:CreditNoteLine', 'cbc:CreditedQuantity', 'unitCode']},
    {quantityUnitPrice: ['cac:CreditNoteLine', 'cac:Price', 'cbc:PriceAmount']},
    {productTaxPercentage: ['cac:CreditNoteLine', 'cac:Item', 'cac:ClassifiedTaxCategory', 'cbc:Percent']},
  ],
}

const SimpleForm = ({formType, path, docs}) => {
  return (
    <div>
      {fields[formType].map((field, i) => {
        const [name, subPath] = Object.entries(field)[0]
        return (<FormField
          key={i}
          path={[...path, name]}
          docs={getChildren(docs, subPath)}
        />)
      })}
    </div>
  )
}

export default SimpleForm
