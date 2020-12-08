import {compose} from 'redux'
import {connect} from 'react-redux'
import {withTranslation} from 'react-i18next'
import InvoiceList from './invoiceList'
import {getPublicInvoices} from '../actions/invoices'

export default compose(
  withTranslation(['TopBar']),
  connect(
    (state, {t}) => ({
      title: t('TopBar:tabs.publicInvoices'),
      path: ['publicInvoicesScreen'],
      areCustomFilterFieldsValid: () => true,
    }),
    {getInvoices: getPublicInvoices}
  ),
)(InvoiceList)
