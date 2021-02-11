export default (api) => {

  const prepareRequest = (params) =>
    api.apiRequest(api.prefixRoute(params, '/invoices'))

  const getPublic = (query, startId) => {
    const queryParams = new URLSearchParams(query)
    if (startId) queryParams.set('startId', startId)
    return prepareRequest({route: `?${queryParams}`})
  }

  const getMeta = (id) => prepareRequest({route: `/${id}`})

  const create = (formData) =>
    prepareRequest({
      method: 'POST',
      route: '',
      data: formData,
      jsonBody: false,
    })

  const createVisualization = (formData) =>
    prepareRequest({
      method: 'POST',
      route: '/visualization',
      data: formData,
      jsonBody: false,
    })

  return {
    create,
    createVisualization,
    getMeta,
    getPublic,
  }
}
