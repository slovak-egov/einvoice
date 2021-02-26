export const ubl21XsdDocsSelector = (state) => state.docs['ubl2.1'].xsd
export const ubl21RulesDocsSelector = (state) => state.docs['ubl2.1'].rules

export const isUblXsdDocsLoadedSelector = (state) => ubl21XsdDocsSelector(state) != null
export const isUblRulesDocsLoadedSelector = (state) => ubl21RulesDocsSelector(state) != null

export const codeListsSelector = (state) => state.docs.codeLists
export const areCodeListsLoadedSelector = (state) => codeListsSelector(state) != null
