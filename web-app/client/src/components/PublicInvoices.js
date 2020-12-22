import {useTranslation} from 'react-i18next'
import InvoiceList from './invoiceList'
import {getPublicInvoices} from '../actions/invoices'

export default () => {
  const {t} = useTranslation('TopBar')

  return (
    <InvoiceList
      title={t('tabs.publicInvoices')}
      path={['publicInvoicesScreen']}
      areCustomFilterFieldsValid={() => true}
      getInvoicesAction={getPublicInvoices}
    />
  )
}
