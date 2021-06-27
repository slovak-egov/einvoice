import {useTranslation} from 'react-i18next'
import {getDoc} from './helpers'
import {Field} from '../Field'

export default ({docs, path, formType}) => {
  const {t} = useTranslation('form')
  return (
    <div>
      <div className="govuk-heading-l">{t('general')}</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:ID'])}
            label={t('invoiceNumber')}
            path={[...path, 'invoiceNumber']}
            id="invoice-number"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:InvoiceTypeCode'], ['cbc:CreditNoteTypeCode'], formType)}
            label={t('invoiceTypeCode')}
            path={[...path, 'invoiceTypeCode']}
            id="invoice-type-code"
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:IssueDate'])}
            label={t('issueDate')}
            path={[...path, 'issueDate']}
            id="issue-date"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:TaxPointDate'])}
            label={t('taxPointDate')}
            path={[...path, 'taxPointDate']}
            id="tax-point-date"
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:DueDate'], ['cac:PaymentMeans', 'cbc:PaymentDueDate'], formType)}
            label={t('dueDate')}
            path={[...path, 'dueDate']}
            id="due-date"
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:ContractDocumentReference', 'cbc:ID'])}
            label={t('contractId')}
            path={[...path, 'contractId']}
            id="contract-id"
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:DocumentCurrencyCode'])}
            label={t('currencyCode')}
            path={[...path, 'currencyCode']}
            id="currency-code"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:OrderReference', 'cbc:ID'])}
            label={t('orderReference')}
            path={[...path, 'orderReference']}
            id="order-reference"
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:Delivery', 'cbc:ActualDeliveryDate'])}
            label={t('deliveryDate')}
            path={[...path, 'deliveryDate']}
            id="delivery-date"
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:BillingReference', 'cac:InvoiceDocumentReference', 'cbc:ID'])}
            label={t('previousInvoiceNumber')}
            path={[...path, 'previousInvoiceNumber']}
            id="previous-invoice-number"
            nullable
          />
        </div>
      </div>
    </div>
  )
}
