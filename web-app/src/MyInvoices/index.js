import {useTranslation} from 'react-i18next'
import InvoiceList from '../InvoiceList'
import {getMyInvoices} from './actions'

export default () => {
  const {t} = useTranslation('common')

  return (
    <InvoiceList
      title={t('topBar.myInvoices')}
      path={['myInvoicesScreen']}
      getInvoicesAction={getMyInvoices}
    />
  )
}
