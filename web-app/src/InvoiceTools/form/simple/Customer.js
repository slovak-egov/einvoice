import {useTranslation} from 'react-i18next'
import {countErrors, getDoc} from './helpers'
import {Field} from '../Field'
import {useDispatch} from 'react-redux'
import {businessTermLink} from '../../../helpers/businessTerms'

export default ({docs, path}) => {
  const {t} = useTranslation('form')
  const dispatch = useDispatch()
  const errorCounter = countErrors(path, dispatch)

  return (
    <div>
      <div className="govuk-heading-l">{t('customer')} ({businessTermLink('BG-7')})</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:RegistrationName'])}
            label={t('customerName')}
            path={[...path, 'name']}
            id="customer-name"
            errorCounter={errorCounter}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cbc:StreetName'])}
            label={t('customerAddressLine1')}
            path={[...path, 'address', 'line1']}
            id="customer-address-line-1"
            errorCounter={errorCounter}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cbc:PostalZone'])}
            label={t('customerPostalZone')}
            path={[...path, 'address', 'postalZone']}
            id="customer-postal-zone"
            errorCounter={errorCounter}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cbc:CityName'])}
            label={t('customerCity')}
            path={[...path, 'address', 'city']}
            id="customer-city"
            errorCounter={errorCounter}
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PostalAddress', 'cac:Country', 'cbc:IdentificationCode'])}
            label={t('customerCountry')}
            path={[...path, 'address', 'country']}
            id="customer-country"
            errorCounter={errorCounter}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyLegalEntity', 'cbc:CompanyID'])}
            label={t('customerIco')}
            path={[...path, 'ico']}
            id="customer-ico"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:PartyTaxScheme', 'cbc:CompanyID'])}
            label={t('customerVatId')}
            path={[...path, 'vatId']}
            id="customer-vat-id"
          />
        </div>
      </div>

      <div className="govuk-heading-m">{t('deliveryAddress')} ({businessTermLink('BG-15')})</div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:Delivery', 'cac:DeliveryLocation', 'cac:Address', 'cbc:StreetName'])}
            label={t('deliveryAddressLine1')}
            path={[...path, 'deliveryAddress', 'line1']}
            id="delivery-address-line-1"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:Delivery', 'cac:DeliveryLocation', 'cac:Address', 'cbc:PostalZone'])}
            label={t('deliveryPostalZone')}
            path={[...path, 'deliveryAddress', 'postalZone']}
            id="delivery-address-postal-zone"
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:Delivery', 'cac:DeliveryLocation', 'cac:Address', 'cbc:CityName'])}
            label={t('deliveryCity')}
            path={[...path, 'deliveryAddress', 'city']}
            id="delivery-address-city"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:Delivery', 'cac:DeliveryLocation', 'cac:Address', 'cac:Country', 'cbc:IdentificationCode'])}
            label={t('deliveryCountry')}
            path={[...path, 'deliveryAddress', 'country']}
            id="delivery-address-country"
            errorCounter={errorCounter}
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
            id="customer-contact-name"
          />
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:Contact', 'cbc:Telephone'])}
            label={t('contactPhone')}
            path={[...path, 'contactPhone']}
            id="customer-contact-phone"
            errorCounter={errorCounter}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            docs={getDoc(docs, ['cac:AccountingCustomerParty', 'cac:Party', 'cac:Contact', 'cbc:ElectronicMail'])}
            label={t('contactEmail')}
            path={[...path, 'contactEmail']}
            id="customer-contact-email"
            errorCounter={errorCounter}
          />
        </div>
      </div>
    </div>
  )
}
