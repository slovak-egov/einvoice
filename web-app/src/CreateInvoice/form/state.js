import {get} from 'lodash'

export const INVOICE_FORM_PATH = ['createInvoiceScreen', 'form']

export const invoiceFormSelector = (state) => get(state, INVOICE_FORM_PATH)

export const invoiceFormFieldSelector = (path) => (state) => get(invoiceFormSelector(state), path)

export const isFormInitialized = (state) => invoiceFormSelector(state) != null

export const getLeafChildInitialState = (docs) => {
  const initialState = {text: ''}
  // Add attributes
  if (docs.attributes != null) {
    initialState.attributes = {}
    for (const [name, attr] of Object.entries(docs.attributes)) {
      initialState.attributes[name] = []
      if (attr.cardinality.from !== '0') {
        initialState.attributes[name].push({text: ''})
      }
    }
  }
  return initialState
}

export const getFormInitialState = (ublDocs) => {
  const result = {}
  for (const [tag, data] of Object.entries(ublDocs)) {
    result[tag] = []
    for (let i = 0; i < parseInt(data.cardinality.from, 10); i++) {
      if (data.children != null) {
        result[tag].push({children: getFormInitialState(data.children)})
      } else {
        result[tag].push(getLeafChildInitialState(data))
      }
    }
  }
  return result
}
