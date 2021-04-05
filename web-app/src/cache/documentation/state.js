export const ublInvoiceDocsSelector = (state) => state.docs['ubl2.1'].invoice
export const ublCreditNoteDocsSelector = (state) => state.docs['ubl2.1'].creditNote
export const ubl21RulesDocsSelector = (state) => state.docs['ubl2.1'].rules
export const ubl21RuleSelector = (id) => (state) => state.docs['ubl2.1'].rules[id]

export const isUblInvoiceDocsLoadedSelector = (state) => ublInvoiceDocsSelector(state) != null
export const isUblCreditNoteDocsLoadedSelector = (state) => ublCreditNoteDocsSelector(state) != null
export const isUblRulesDocsLoadedSelector = (state) => ubl21RulesDocsSelector(state) != null

export const businessTermsDocsSelector = (state) => state.docs.businessTerms
export const businessTermSelector = (term) => (state) => businessTermsDocsSelector(state)[term]
export const isBusinessTermsDocsLoadedSelector = (state) => businessTermsDocsSelector(state) != null

export const codeListsSelector = (state) => state.docs.codeLists
export const areCodeListsLoadedSelector = (state) => codeListsSelector(state) != null
export const currencyListSelector = (state) => {
  const currencyList = codeListsSelector(state)?.ISO4217?.codes
  return currencyList && Object.keys(currencyList)
}
