import {dropRight} from 'lodash'
import {getFormInitialState, invoiceFormSelector, INVOICE_FORM_PATH} from './state'
import {setInvoiceSubmissionData, setInvoiceSubmissionFormat} from '../actions'
import {loadingWrapper, setData} from '../../helpers/actions'
import {ubl21XsdDocsSelector} from '../../cache/documentation/state'
import {generateInvoice} from '../../utils/invoiceGenerator'
import {invoiceFormats} from '../../utils/constants'

export const setInvoiceFormField = (path) => setData([...INVOICE_FORM_PATH, ...path])

export const addFieldInstance = (path, data) => ({
  type: 'ADD INVOICE FIELD',
  path: [...INVOICE_FORM_PATH, ...path],
  payload: data,
  reducer: (state, data) => [...state, data],
})

export const removeFieldInstance = (path) => ({
  type: 'ADD INVOICE FIELD',
  path: [...INVOICE_FORM_PATH, ...path],
  payload: null,
  reducer: (state) => dropRight(state),
})

export const initializeFormState = () => (
  (dispatch, getState) => {
    // Add fake start point and unwrap it at the end
    const initialState = getFormInitialState({
      children: ubl21XsdDocsSelector(getState()),
    }).children
    dispatch(setInvoiceFormField([])(initialState))
  }
)

export const submitInvoiceForm = () => loadingWrapper(
  async (dispatch, getState) => {
    const invoiceForm = invoiceFormSelector(getState())
    const xml = await generateInvoice(invoiceForm['ubl:Invoice'][0])
    const invoiceFile = new File([xml], 'invoice.xml', {type: 'application/xml'})
    dispatch(setInvoiceSubmissionData(invoiceFile))
    dispatch(setInvoiceSubmissionFormat(invoiceFormats.UBL))
  }
)
