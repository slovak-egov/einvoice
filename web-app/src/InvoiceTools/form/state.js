import {get} from 'lodash'

export const FORM_PATH = ['createInvoiceScreen', 'form']
export const FORM_TYPE_PATH = [...FORM_PATH, 'type']

export const formTypeSelector = (state) => get(state, FORM_TYPE_PATH)

export const formDataSelector = (state) => get(state, FORM_PATH)

export const formFieldSelector = (path) => (state) => get(formDataSelector(state), path)

export const isFormInitialized = (invoiceType) => (state) =>
  formDataSelector(state)[invoiceType] != null

export const getFormInitialState = (ublDocs) => {
  const result = {}
  if (ublDocs.dataType != null) result.text = ublDocs.defaultValue || ''
  if (ublDocs.attributes != null) {
    result.attributes = {}
    for (const [name, attr] of Object.entries(ublDocs.attributes)) {
      result.attributes[name] = []
      if (attr.cardinality.from !== '0') {
        result.attributes[name].push({text: attr.defaultValue || ''})
      }
    }
  }
  if (ublDocs.children != null) {
    result.children = {}
    for (const [tag, child] of Object.entries(ublDocs.children)) {
      result.children[tag] = []
      for (let i = 0; i < parseInt(child.cardinality.from, 10); i++) {
        result.children[tag].push(getFormInitialState(child))
      }
    }
  }
  return result
}
