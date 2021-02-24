import swal from 'sweetalert'
import {INVOICE_SUBMISSION_PATH} from './state'
import {setInvoices} from '../cache/invoices/actions'
import {loadingWrapper, setData} from '../helpers/actions'
import {invoiceFormats} from '../utils/constants'
import i18n from '../i18n'

export const setInvoiceSubmissionFormat = setData([...INVOICE_SUBMISSION_PATH, 'format'])
export const setInvoiceSubmissionData = setData([...INVOICE_SUBMISSION_PATH, 'invoice'])
export const setInvoiceSubmissionTest = setData([...INVOICE_SUBMISSION_PATH, 'test'])
export const setForeignSupplier = setData([...INVOICE_SUBMISSION_PATH, 'foreignSupplier'])

export const resetInvoiceSubmission = () =>
  (dispatch) => {
    dispatch(setInvoiceSubmissionFormat(invoiceFormats.UBL))
    dispatch(setInvoiceSubmissionData(null))
    dispatch(setInvoiceSubmissionTest(false))
  }

export const createInvoice = (data) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const invoice = await api.invoices.create(data)
      dispatch(setInvoices({
        [invoice.id]: invoice,
      }))

      const redirect = await swal({
        title: i18n.t('successMessages.createInvoice.title'),
        icon: 'success',
        buttons: [
          i18n.t('successMessages.createInvoice.buttons.0'),
          i18n.t('successMessages.createInvoice.buttons.1'),
        ],
      })
      return {
        invoiceId: invoice.id,
        redirect,
      }
    } catch (error) {
      await swal({
        title: error.message,
        text: error.detail,
        icon: 'error',
      })
      return {
        invoiceId: null,
        redirect: false,
      }
    }
  }
)

export const getInvoiceVisualization = (data) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      return await api.invoices.createVisualization(data)
    } catch (error) {
      await swal({
        title: error.message,
        text: error.detail,
        icon: 'error',
      })
      return null
    }
  }
)
