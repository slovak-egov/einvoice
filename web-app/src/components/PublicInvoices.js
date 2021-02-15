import {useTranslation} from 'react-i18next'
import InvoiceList from './invoiceList'
import {getPublicInvoices} from '../actions/invoices'

export default () => {
  const {t} = useTranslation('common')

  return (
    <InvoiceList
      title={t('topBar.publicInvoices')}
      path={['publicInvoicesScreen']}
      areCustomFilterFieldsValid={() => true}
      getInvoicesAction={getPublicInvoices}
    />
  )
}
