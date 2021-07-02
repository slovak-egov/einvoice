import {useTranslation} from 'react-i18next'
import {businessTermLink, countErrors, getDoc} from './helpers'
import {Field} from '../Field'
import {useDispatch, useSelector} from 'react-redux'
import {formFieldSelector} from '../state'
import {useEffect} from 'react'
import {setFormField} from '../actions'
import {codeListsSelector} from '../../../cache/documentation/state'

export default ({docs, path}) => {
  const {t, i18n} = useTranslation('form')
  const dispatch = useDispatch()
  const codeLists = useSelector(codeListsSelector)
  const errorCounter = countErrors(path, dispatch)

  const paymentMeansCode = useSelector(formFieldSelector([...path, 'paymentMeansCode']))

  useEffect(() => {
    dispatch(setFormField([...path, 'paymentMeans'])(
      paymentMeansCode && codeLists.UNCL4461.codes[paymentMeansCode] &&
      codeLists.UNCL4461.codes[paymentMeansCode].name[i18n.language]
    ))
  }, [paymentMeansCode])

  return (
    <div>
      <div className="govuk-heading-l">{t('supplier')} ({businessTermLink('BG-4')})</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName'])}
            label={t('supplierName')}
            path={[...path, 'name']}
            id="supplier-name"
            errorCounter={errorCounter}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cbc:StreetName'])}
            label={t('supplierAddressLine1')}
            path={[...path, 'address', 'line1']}
            id="supplier-address-line-1"
            errorCounter={errorCounter}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cbc:PostalZone'])}
            label={t('supplierPostalZone')}
            path={[...path, 'address', 'postalZone']}
            id="supplier-postal-zone"
            errorCounter={errorCounter}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cbc:CityName'])}
            label={t('supplierCity')}
            path={[...path, 'address', 'city']}
            id="supplier-city"
            errorCounter={errorCounter}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cac:Country', 'cbc:IdentificationCode'])}
            label={t('supplierCountry')}
            path={[...path, 'address', 'country']}
            id="supplier-country"
            errorCounter={errorCounter}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:CompanyLegalForm'])}
            label={t('supplierLegalForm')}
            path={[...path, 'legalForm']}
            id="supplier-legal-form"
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:CompanyID'])}
            label={t('supplierIco')}
            path={[...path, 'ico']}
            id="supplier-ico"
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:CompanyID'])}
            label={t('supplierVatId')}
            path={[...path, 'vatId']}
            id="supplier-vat-id"
            nullable
          />
        </div>
      </div>
      <div className="govuk-heading-m">{t('payment')} ({businessTermLink('BG-16')})</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs, ['cac:PaymentMeans', 'cbc:PaymentMeansCode'])}
            label={t('paymentMeansCode')}
            path={[...path, 'paymentMeansCode']}
            id="payment-means-code"
            errorCounter={errorCounter}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:PaymentMeans', 'cbc:PaymentID'])}
            label={t('paymentId')}
            path={[...path, 'paymentId']}
            id="payment-id"
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:PaymentMeans', 'cac:PayeeFinancialAccount', 'cbc:ID'])}
            label={t('paymentAccountId')}
            path={[...path, 'paymentAccountId']}
            id="payment-account-id"
            errorCounter={errorCounter}
          />
        </div>
      </div>

      <div className="govuk-heading-m">{t('supplierContact')} ({businessTermLink('BG-6')})</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:Contact', 'cbc:Name'])}
            label={t('contactName')}
            path={[...path, 'contactName']}
            id="supplier-contact-name"
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:Contact', 'cbc:Telephone'])}
            label={t('contactPhone')}
            path={[...path, 'contactPhone']}
            id="supplier-contact-phone"
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:Contact', 'cbc:ElectronicMail'])}
            label={t('contactEmail')}
            path={[...path, 'contactEmail']}
            id="supplier-contact-email"
            nullable
          />
        </div>
      </div>
    </div>
  )
}
