import swal from 'sweetalert'
import {setInvoices} from './invoices'
import {loadingWrapper, setData} from './common'
import {invoiceFormats} from '../utils/constants'

export const setInvoiceSubmissionFormat = setData(['createInvoiceScreen', 'submission', 'format'])
export const setInvoiceSubmissionData = setData(['createInvoiceScreen', 'submission', 'invoice'])
export const setInvoiceSubmissionTest = setData(['createInvoiceScreen', 'submission', 'test'])
export const setForeignSupplier = setData(['createInvoiceScreen', 'submission', 'foreignSupplier'])

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
