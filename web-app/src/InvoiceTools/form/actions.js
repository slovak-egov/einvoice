import swal from 'sweetalert'
import {dropRight, get} from 'lodash'
import {formDataSelector, FORM_PATH, FORM_TYPE_PATH, FORM_DRAFT_META_PATH, FORM_COMPLEXITY_PATH, getFormInitialState} from './state'
import {setInvoiceSubmissionData} from '../actions'
import {loadingWrapper, setData} from '../../helpers/actions'
import {generateInvoice} from '../../utils/invoiceGenerator'
import i18n from '../../i18n'
import {invoiceComplexities} from '../../utils/constants'

export const setFormField = (path) => setData([...FORM_PATH, ...path])
export const setFormType = setData(FORM_TYPE_PATH)
export const setFormComplexity = setData(FORM_COMPLEXITY_PATH)
export const setFormDraftMeta = setData(FORM_DRAFT_META_PATH)

export const addFieldInstance = (path, data) => ({
  type: 'ADD INVOICE FIELD',
  path: [...FORM_PATH, ...path],
  payload: data,
  reducer: (state, data) => [...state, data],
})

export const removeFieldInstance = (path) => ({
  type: 'REMOVE INVOICE FIELD',
  path: [...FORM_PATH, ...path],
  payload: null,
  reducer: (state) => dropRight(state),
})

export const initializeFormState = (invoiceType, invoiceComplexity, docs) => (
  (dispatch) => {
    if (invoiceComplexity === invoiceComplexities.SIMPLE) {
      dispatch(setFormField([invoiceType, invoiceComplexity])({
        general: {},
        supplier: {},
        customer: {},
        items: {list: {1: {}}},
        recapitulation: {},
        notes: {},
      }))
    } else {
      // Add fake start point and unwrap it at the end
      const initialState = getFormInitialState({
        children: docs,
      }).children
      dispatch(setFormField([invoiceType, invoiceComplexity])(initialState))
    }
  }
)

export const submitInvoiceForm = (invoiceType, invoiceComplexity, rootPath) => loadingWrapper(
  async (dispatch, getState) => {
    const invoiceForm = formDataSelector(getState())
    const path = [...rootPath]
    if (invoiceComplexity === invoiceComplexities.COMPLEX) path.push(0)
    const xml = await generateInvoice(get(invoiceForm, path), invoiceType, invoiceComplexity)
    const invoiceFile = new File([xml], `${invoiceType}.xml`, {type: 'application/xml'})
    dispatch(setInvoiceSubmissionData(invoiceFile))
  }
)

export const initializeDraftForm = (draftMeta) => loadingWrapper(
  async (dispatch, getState, {api}) => {
    try {
      const {type, complexity, data} = await api.drafts.get(draftMeta.id)
      dispatch(setFormField([type, complexity])(data))
      dispatch(setFormType(type))
      dispatch(setFormComplexity(complexity))
      dispatch(setFormDraftMeta(draftMeta))
      return true
    } catch (error) {
      await swal({
        title: i18n.t('errorMessages.getDraft', {id: draftMeta.id}),
        text: error.message,
        icon: 'error',
      })
      return false
    }
  }
)

export const addItem = (path, index) => ({
  type: 'ADD INVOICE ITEM',
  path: [...FORM_PATH, ...path, 'list'],
  payload: {},
  reducer: (state) => ({...state, [index]: {}}),
})

export const removeItem = (path, index) => ({
  type: 'REMOVE INVOICE ITEM',
  path: [...FORM_PATH, ...path, 'list'],
  payload: null,
  reducer: (state) => {
    const s = {...state}
    delete s[index]
    return s
  },
})
