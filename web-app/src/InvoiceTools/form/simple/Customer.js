import {useTranslation} from 'react-i18next'
import {businessTermLink, getDoc} from './helpers'
import {Field} from '../Field'

export default ({docs, path}) => {
  const {t} = useTranslation('form')
  return (
    <div>
      <div className="govuk-heading-l">{t('customer')} ({businessTermLink('BG-7')})</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName'])}
            label={t('partyName')}
            path={[...path, 'name']}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cbc:StreetName'])}
            label={t('addressLine1')}
            path={[...path, 'address', 'line1']}
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cbc:PostalZone'])}
            label={t('postalZone')}
            path={[...path, 'address', 'postalZone']}
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cbc:CityName'])}
            label={t('city')}
            path={[...path, 'address', 'city']}
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cac:Country', 'cbc:IdentificationCode'])}
            label={t('country')}
            path={[...path, 'address', 'country']}
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:CompanyID'])}
            label={t('partyIco')}
            path={[...path, 'ico']}
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:CompanyID'])}
            label={t('partyVatId')}
            path={[...path, 'vatId']}
            nullable
          />
        </div>
      </div>

      <div className="govuk-heading-m">{t('deliveryAddress')} ({businessTermLink('BG-15')})</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:Delivery', 'cac:DeliveryLocation', 'cac:Address', 'cbc:StreetName'])}
            label={t('addressLine1')}
            path={[...path, 'deliveryAddress', 'line1']}
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:Delivery', 'cac:DeliveryLocation', 'cac:Address', 'cbc:PostalZone'])}
            label={t('postalZone')}
            path={[...path, 'deliveryAddress', 'postalZone']}
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:Delivery', 'cac:DeliveryLocation', 'cac:Address', 'cbc:CityName'])}
            label={t('city')}
            path={[...path, 'deliveryAddress', 'city']}
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:Delivery', 'cac:DeliveryLocation', 'cac:Address', 'cac:Country', 'cbc:IdentificationCode'])}
            label={t('country')}
            path={[...path, 'deliveryAddress', 'country']}
            nullable
          />
        </div>
      </div>

      <div className="govuk-heading-m">{t('contact')} ({businessTermLink('BG-9')})</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:Contact', 'cbc:Name'])}
            label={t('contactName')}
            path={[...path, 'contactName']}
            nullable
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:Contact', 'cbc:Telephone'])}
            label={t('contactPhone')}
            path={[...path, 'contactPhone']}
            nullable
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:Contact', 'cbc:ElectronicMail'])}
            label={t('contactEmail')}
            path={[...path, 'contactEmail']}
            nullable
          />
        </div>
      </div>
    </div>
  )
}
