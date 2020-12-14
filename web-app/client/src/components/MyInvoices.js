import './invoiceList/Filters.css'
import React, {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {FormCheck} from 'react-bootstrap'
import {useTranslation} from 'react-i18next'
import InvoiceList from './invoiceList'
import {getMyInvoices} from '../actions/invoices'
import {toggleField} from '../actions/common'
import {myInvoicesFiltersSelector} from '../state/invoices'

const Filter = () => {
  const {t} = useTranslation('common')

  const filters = useSelector(myInvoicesFiltersSelector)

  const dispatch = useDispatch()
  const toggleFilter = useCallback(
    (field) => () => dispatch(toggleField(['myInvoicesScreen', 'filters', field])), [dispatch]
  )
  return (
    <React.Fragment>
      <strong className="filter-heading">{t('invoiceType')}</strong>
      <div className="d-flex">
        <FormCheck
          type="checkbox"
          checked={filters.supplied}
          label={t('supplied')}
          onChange={toggleFilter('supplied')}
          className="mr-3"
        />
        <FormCheck
          type="checkbox"
          checked={filters.received}
          label={t('received')}
          onChange={toggleFilter('received')}
        />
      </div>
    </React.Fragment>
  )
}

export default () => {
  const {t} = useTranslation('TopBar')
  const dispatch = useDispatch()
  const getInvoices = useCallback(
    (params) => dispatch(getMyInvoices(params)), [dispatch]
  )

  return (
    <InvoiceList
      title={t('tabs.myInvoices')}
      path={['myInvoicesScreen']}
      CustomFilter={Filter}
      areCustomFilterFieldsValid={(filters) => filters.supplied || filters.received}
      getInvoices={getInvoices}
    />
  )
}
