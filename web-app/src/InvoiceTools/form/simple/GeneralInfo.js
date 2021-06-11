import {useTranslation} from 'react-i18next'
import {getDoc} from './helpers'
import {Field} from '../Field'

export default ({docs, path, formType}) => {
  const {t} = useTranslation('form')
  return (
    <div>
      <div className="govuk-heading-l">{t('generalInfo')}</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:ID'])}
            label={t('invoiceNumber')}
            path={[...path, 'invoiceNumber']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:InvoiceTypeCode'], ['cbc:CreditNoteTypeCode'], formType)}
            label={t('invoiceTypeCode')}
            path={[...path, 'invoiceTypeCode']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:IssueDate'])}
            label={t('issueDate')}
            path={[...path, 'issueDate']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:TaxPointDate'])}
            label={t('taxPointDate')}
            path={[...path, 'taxPointDate']}
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
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:ContractDocumentReference', 'cbc:ID'])}
            label={t('contractId')}
            path={[...path, 'contractId']}
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
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:OrderReference', 'cbc:ID'])}
            label={t('orderReference')}
            path={[...path, 'orderReference']}
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
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:BillingReference', 'cac:InvoiceDocumentReference', 'cbc:ID'])}
            label={t('previousInvoiceNumber')}
            path={[...path, 'previousInvoiceNumber']}
            nullable
          />
        </div>
      </div>
    </div>
  )
}
