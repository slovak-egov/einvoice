import {useTranslation} from 'react-i18next'
import {getDoc} from './docs'
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
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:BillingReference', 'cac:InvoiceDocumentReference', 'cbc:ID'])}
            label={t('previousInvoiceNumber')}
            path={[...path, 'previousInvoiceNumber']}
            nullable
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
            docs={getDoc(docs, ['cbc:DocumentCurrencyCode'])}
            label={t('currencyCode')}
            path={[...path, 'currencyCode']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:IssueDate'])}
            label={t('issueDate')}
            path={[...path, 'issueDate']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:TaxPointDate'])}
            label={t('taxPointDate')}
            path={[...path, 'taxPointDate']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cbc:DueDate'], ['cac:PaymentMeans', 'cbc:PaymentDueDate'], formType)}
            label={t('dueDate')}
            path={[...path, 'dueDate']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:PaymentMeans', 'cbc:PaymentID'])}
            label={t('paymentId')}
            path={[...path, 'paymentId']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
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
            docs={getDoc(docs, ['cac:OriginatorDocumentReference', 'cbc:ID'])}
            label={t('originatorDocumentId')}
            path={[...path, 'originatorDocumentId']}
            nullable
          />
        </div>
      </div>
    </div>
  )
}
