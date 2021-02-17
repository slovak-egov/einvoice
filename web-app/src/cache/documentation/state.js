export const ubl21DocsSelector = (state) => state.docs['ubl2.1']

export const isUblDocsLoadedSelector = (state) => ubl21DocsSelector(state) != null

export const codeListsSelector = (state) => state.docs.codeLists
export const areCodeListsLoadedSelector = (state) => codeListsSelector(state) != null
