export default (api) => {
  const prepareRequest = (params) => api.apiRequest(api.prefixRoute(params, '/data'))

  const getUblInvoice = () => prepareRequest({route: '/schemas/ubl2.1/invoice-documentation.json'})
  const getUblCreditNote = () => prepareRequest({route: '/schemas/ubl2.1/creditNote-documentation.json'})
  const getUblRules = () => prepareRequest({route: '/schemas/ubl2.1/rules-documentation.json'})

  const getBusinessTerms = () => prepareRequest({route: '/schemas/businessTerms/docs.json'})

  const getCodeLists = () => prepareRequest({route: '/codeLists.json'})

  const getFormValidations = () => prepareRequest({route: '/formValidations.json'})

  return {
    getBusinessTerms,
    getCodeLists,
    getUblCreditNote,
    getUblInvoice,
    getUblRules,
    getFormValidations,
  }
}
