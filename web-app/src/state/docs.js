import {get} from 'lodash'

export const ubl21DocsSelector = (state) => state.docs['ubl2.1']

export const isUblDocsLoadedSelector = (state) => ubl21DocsSelector(state) != null

// Distinguish path to child and attribute
const getElementPath = (v) => {
  if (v.startsWith('@')) return ['attributes', v.slice(1)]
  else return ['children', v]
}

export const tagDocsSelector = (tagPath) => (state) => {
  const path = tagPath.flatMap((v, i) => i === 0 ? [v] : getElementPath(v))
  return get(ubl21DocsSelector(state), path)
}

export const invoiceRulesDocsSelector = (state) => state.docs.rules
export const areRulesLoadedSelector = (state) => invoiceRulesDocsSelector(state) != null
export const invoiceRuleDocsSelector = (name) =>
  (state) => get(invoiceRulesDocsSelector(state), name)
