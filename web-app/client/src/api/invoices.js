export default (api) => {

  const prepareRequest = (params) =>
    api.apiRequest(api.prefixRoute(params, '/invoices'))

  const getPublic = (params) =>
    prepareRequest({route: `?${new URLSearchParams(api.getInvoicesQueryParams(params))}`})

  const getMeta = (id) => prepareRequest({route: `/${id}`})

  const create = (formData) =>
    prepareRequest({
      method: 'POST',
      route: '',
      data: formData,
      jsonBody: false,
    })

  return {
    create,
    getMeta,
    getPublic,
  }
}
