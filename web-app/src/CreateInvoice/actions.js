import swal from 'sweetalert'
import {INVOICE_SUBMISSION_PATH} from './state'
import {setInvoices} from '../cache/invoices/actions'
import {loadingWrapper, setData} from '../helpers/actions'
import {invoiceFormats} from '../utils/constants'

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
        title: 'Invoice was created',
        icon: 'success',
        buttons: ['Create another', 'Check detail'],
      })
      return {
        invoiceId: invoice.id,
        redirect,
      }
    } catch (error) {
      let text = error.message
      if (error.detail) text += `\n${error.detail}`
      await swal({
        title: 'Invoice could not be created',
        text,
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
      let text = error.message
      if (error.detail) text += `\n${error.detail}`
      await swal({
        title: 'Invoice could not be visualized',
        text,
        icon: 'error',
      })
      return null
    }
  }
)
