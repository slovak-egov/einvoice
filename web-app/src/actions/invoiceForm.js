import {dropRight} from 'lodash'
import {loadingWrapper, setData} from './common'
import {setInvoiceSubmissionData} from './createInvoiceScreen'
import {ubl21DocsSelector} from '../state/docs'
import {getFormInitialState, invoiceFormSelector} from '../state/invoiceForm'
import {generateInvoice} from '../utils/invoiceGenerator'

export const setInvoiceFormField = (path) => setData(['createInvoiceScreen', 'form', ...path])

export const addFieldInstance = (path, data) => ({
  type: 'ADD INVOICE FIELD',
  path: ['createInvoiceScreen', 'form', ...path],
  payload: data,
  reducer: (state, data) => [...state, data],
})

export const removeFieldInstance = (path) => ({
  type: 'ADD INVOICE FIELD',
  path: ['createInvoiceScreen', 'form', ...path],
  payload: null,
  reducer: (state) => dropRight(state),
})

export const initializeFormState = () => (
  (dispatch, getState) => {
    const initialState = getFormInitialState(ubl21DocsSelector(getState()))
    dispatch(setInvoiceFormField([])(initialState))
  }
)

export const submitInvoiceForm = () => loadingWrapper(
  async (dispatch, getState) => {
    const invoiceForm = invoiceFormSelector(getState())
    const xml = await generateInvoice(invoiceForm['ubl:Invoice'][0])
    const invoiceFile = new File([xml], 'invoice.xml', {type: 'application/xml'})
    dispatch(setInvoiceSubmissionData(invoiceFile))
  }
)
