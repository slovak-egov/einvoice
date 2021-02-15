import './invoiceList/Filters.css'
import {FormCheck} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import InvoiceList from './invoiceList'
import {getMyInvoices} from '../actions/invoices'

const Filter = ({extraQuery, setExtraQuery}) => {
  const {t} = useTranslation('common')

  const toggleFilter = (param) => () => {
    const newValue = new URLSearchParams(extraQuery)
    if (extraQuery.get(param) === 'true') newValue.delete(param)
    else newValue.set(param, 'true')

    setExtraQuery(newValue)
  }

  return (
    <>
      <strong className="filter-heading">{t('invoiceType')}</strong>
      <div className="d-flex">
        <FormCheck
          type="checkbox"
          checked={extraQuery.get('supplied') === 'true'}
          label={t('supplied')}
          onChange={toggleFilter('supplied')}
          className="mr-3"
        />
        <FormCheck
          type="checkbox"
          checked={extraQuery.get('received') === 'true'}
          label={t('received')}
          onChange={toggleFilter('received')}
        />
      </div>
    </>
  )
}

const filterValidator = (q) => q.get('supplied') === 'true' || q.get('received') === 'true'

export default () => {
  const {t} = useTranslation('common')

  return (
    <InvoiceList
      title={t('topBar.myInvoices')}
      path={['myInvoicesScreen']}
      CustomFilter={Filter}
      areCustomFilterFieldsValid={filterValidator}
      getInvoicesAction={getMyInvoices}
    />
  )
}
