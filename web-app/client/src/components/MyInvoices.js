import './invoiceList/Filters.css'
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {FormCheck} from 'react-bootstrap'
import {useTranslation, withTranslation} from 'react-i18next'
import InvoiceList from './invoiceList'
import Auth from './helpers/Auth'
import {getMyInvoices} from '../actions/invoices'
import {toggleField} from '../actions/common'

const FilterView = ({filters, toggleField}) => {
  const {t} = useTranslation('common')
  return (
    <React.Fragment>
      <strong className="filter-heading">{t('invoiceType')}</strong>
      <div className="d-flex">
        <FormCheck
          type="checkbox"
          checked={filters.supplied}
          label={t('supplied')}
          onChange={toggleField('supplied')}
          className="mr-3"
        />
        <FormCheck
          type="checkbox"
          checked={filters.received}
          label={t('received')}
          onChange={toggleField('received')}
        />
      </div>
    </React.Fragment>
  )
}

const Filter = connect(
  (state) => ({
    filters: state.myInvoicesScreen.filters,
  }),
  (dispatch) => ({
    toggleField: (field) => () => dispatch(toggleField(['myInvoicesScreen', 'filters', field])),
  })
)(FilterView)

export default Auth(
  compose(
    withTranslation(['TopBar']),
    connect(
      (state, {t}) => ({
        title: t('TopBar:tabs.myInvoices'),
        path: ['myInvoicesScreen'],
        CustomFilter: Filter,
        areCustomFilterFieldsValid: (filters) => filters.supplied || filters.received,
      }),
      {getInvoices: getMyInvoices}
    ),
  )(InvoiceList)
)
