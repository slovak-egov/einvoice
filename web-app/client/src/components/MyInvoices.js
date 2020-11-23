import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {FormCheck} from 'react-bootstrap'
import {useTranslation, withTranslation} from 'react-i18next'
import InvoiceList from './invoiceList'
import {getMyInvoices} from '../actions/invoices'
import {toggleField} from '../actions/common'

const FilterView = ({filters, toggleField}) => {
  const {t} = useTranslation('common')
  return (
    <React.Fragment>
      <strong style={{textDecoration: 'underline', fontSize: '20px'}}>{t('invoiceType')}</strong>
      <div style={{display: 'flex'}}>
        <FormCheck
          type="checkbox"
          checked={filters.supplied}
          label={t('supplied')}
          onChange={() => toggleField('supplied')}
          style={{marginRight: '15px'}}
        />
        <FormCheck
          type="checkbox"
          checked={filters.received}
          label={t('received')}
          onChange={() => toggleField('received')}
          style={{marginRight: '15px'}}
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
    toggleField: (field) => dispatch(toggleField(['myInvoicesScreen', 'filters', field]))
  })
)(FilterView)

export default compose(
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
