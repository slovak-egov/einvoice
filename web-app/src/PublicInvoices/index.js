import {useTranslation} from 'react-i18next'
import InvoiceList from '../InvoiceList'
import {getPublicInvoices} from './actions'

export default () => {
  const {t} = useTranslation('common')

  return (
    <InvoiceList
      title={t('topBar.publicInvoices')}
      path={['publicInvoicesScreen']}
      getInvoicesAction={getPublicInvoices}
    />
  )
}
