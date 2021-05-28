import {useTranslation} from 'react-i18next'
import {getDoc} from './docs'
import {Field} from '../Field'

export default ({docs, path}) => {
  const {t} = useTranslation('form')
  return (
    <div>
      <div className="govuk-heading-l">{t('supplier')}</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:CompanyID'])}
            label={t('partyIco')}
            path={[...path, 'ico']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:CompanyID'])}
            label={t('partyVatId')}
            path={[...path, 'vatId']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName'])}
            label={t('partyName')}
            path={[...path, 'name']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyName', 'cbc:Name'])}
            label={t('partyBusinessName')}
            path={[...path, 'businessName']}
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:CompanyLegalForm'])}
            label={t('legalForm')}
            path={[...path, 'legalForm']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cbc:StreetName'])}
            label={t('addressLine1')}
            path={[...path, 'address', 'line1']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cbc:PostalZone'])}
            label={t('postalZone')}
            path={[...path, 'address', 'postalZone']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cbc:CityName'])}
            label={t('city')}
            path={[...path, 'address', 'city']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:PostalAddress', 'cac:Country', 'cbc:IdentificationCode'])}
            label={t('country')}
            path={[...path, 'address', 'country']}
          />
        </div>
      </div>
      <div className="govuk-heading-m">{t('payment')}</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:PaymentMeans', 'cbc:PaymentMeansCode'])}
            label={t('paymentMeansCode')}
            path={[...path, 'paymentMeansCode']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:PaymentMeans', 'cbc:PaymentMeansCode', 'name'])}
            label={t('paymentMeans')}
            path={[...path, 'paymentMeans']}
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
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:PaymentMeans', 'cac:PayeeFinancialAccount', 'cbc:ID'])}
            label={t('paymentAccountId')}
            path={[...path, 'paymentAccountId']}
          />
        </div>
      </div>
      <div className="govuk-heading-m">{t('contact')}</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:Contact', 'cbc:Name'])}
            label={t('contactName')}
            path={[...path, 'contactName']}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:Contact', 'cbc:Telephone'])}
            label={t('contactPhone')}
            path={[...path, 'contactPhone']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingSupplierParty', 'cac:Party', 'cac:Contact', 'cbc:ElectronicMail'])}
            label={t('contactEmail')}
            path={[...path, 'contactEmail']}
          />
        </div>
      </div>
    </div>
  )
}
