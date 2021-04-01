import {useTranslation} from 'react-i18next'
import {CrossRoads} from '../helpers/idsk'

export default ({match}) => {
  const {t} = useTranslation('common')
  return (
    <>
      <h1 className="govuk-heading-l">{t('invoiceDocumentation')}</h1>
      <CrossRoads
        items={[
          {
            title: `UBL2.1 ${t('invoiceTypes.invoice')}`,
            to: `${match.url}/ublInvoice`,
          },
          {
            title: `UBL2.1 ${t('invoiceTypes.creditNote')}`,
            to: `${match.url}/ublCreditNote`,
          },
          {
            title: t('invoiceDocs.ublRules'),
            to: `${match.url}/ublRules`,
          },
          {
            title: t('invoiceDocs.codeLists'),
            to: `${match.url}/codeLists`,
          },
          {
            title: t('invoiceDocs.businessTerms'),
            to: `${match.url}/businessTerms`,
          },
        ]}
      />
    </>
  )
}
