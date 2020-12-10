export default (api) => {

  const prepareRequest = (params) =>
    api.apiRequest(api.prefixRoute(params, '/invoices'))

  const getPublic = (params) =>
    prepareRequest({route: `?${new URLSearchParams(api.getInvoicesQueryParams(params))}`})

  const getDetail = (id) =>
    prepareRequest({
      route: `/${id}/detail`,
      jsonResponse: false,
    })

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
    getDetail,
    getMeta,
    getPublic,
  }
}
