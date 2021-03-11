import swal from 'sweetalert'
import {INVOICE_SUBMISSION_PATH} from './state'
import {setInvoices} from '../cache/invoices/actions'
import {loadingWrapper, setData} from '../helpers/actions'
import i18n from '../i18n'

export const setInvoiceSubmissionData = setData([...INVOICE_SUBMISSION_PATH, 'invoice'])
export const setInvoiceSubmissionTest = setData([...INVOICE_SUBMISSION_PATH, 'test'])

export const resetInvoiceSubmission = setData(INVOICE_SUBMISSION_PATH)({
  invoice: null,
  test: false,
})

export const createInvoice = (data, test, language) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const invoice = test ? await api.invoices.createTest(data, language) : await api.invoices.create(data, language)
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

export const getInvoiceVisualization = (data, language) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      return await api.invoices.createVisualization(data, language)
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
