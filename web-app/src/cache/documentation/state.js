export const ublInvoiceDocsSelector = (state) => state.docs['ubl2.1'].invoice
export const ublCreditNoteDocsSelector = (state) => state.docs['ubl2.1'].creditNote
export const ubl21RulesDocsSelector = (state) => state.docs['ubl2.1'].rules
export const ubl21RuleSelector = (id) => (state) => state.docs['ubl2.1'].rules[id]

export const isUblInvoiceDocsLoadedSelector = (state) => ublInvoiceDocsSelector(state) != null
export const isUblCreditNoteDocsLoadedSelector = (state) => ublCreditNoteDocsSelector(state) != null
export const isUblRulesDocsLoadedSelector = (state) => ubl21RulesDocsSelector(state) != null

export const codeListsSelector = (state) => state.docs.codeLists
export const areCodeListsLoadedSelector = (state) => codeListsSelector(state) != null
