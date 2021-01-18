import {get} from 'lodash'

export const ubl21DocsSelector = (state) => state.docs['ubl2.1']

export const isUblDocsLoadedSelector = (state) => ubl21DocsSelector(state) != null
export const tagDocsSelector = (name) => (state) => get(ubl21DocsSelector(state), name)

export const invoiceRulesDocsSelector = (state) => state.docs.rules
export const areRulesLoadedSelector = (state) => invoiceRulesDocsSelector(state) != null
export const invoiceRuleDocsSelector = (name) =>
  (state) => get(invoiceRulesDocsSelector(state), name)
