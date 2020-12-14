import React, {useCallback} from 'react'
import {useDispatch} from 'react-redux'
import {useTranslation} from 'react-i18next'
import InvoiceList from './invoiceList'
import {getPublicInvoices} from '../actions/invoices'

export default () => {
  const {t} = useTranslation('TopBar')
  const dispatch = useDispatch()
  const getInvoices = useCallback(
    (params) => dispatch(getPublicInvoices(params)), [dispatch]
  )

  return (
    <InvoiceList
      title={t('tabs.publicInvoices')}
      path={['publicInvoicesScreen']}
      areCustomFilterFieldsValid={() => true}
      getInvoices={getInvoices}
    />
  )
}
