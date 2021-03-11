export default (api) => {

  const prepareRequest = (params) =>
    api.apiRequest(api.prefixRoute(params, '/invoices'))

  const getPublic = (query, startId) => {
    const queryParams = new URLSearchParams(query)
    if (startId) queryParams.set('startId', startId)
    return prepareRequest({route: `?${queryParams}`})
  }

  const getMeta = (id) => prepareRequest({route: `/${id}`})

  const create = (body, test, language) =>
    prepareRequest({
      method: 'POST',
      route: test ? '/test' : '',
      data: body,
      jsonBody: false,
      headers: {
        'Accept-Language': language,
      },
    })

  const createVisualization = (body, language) =>
    prepareRequest({
      method: 'POST',
      route: '/visualization',
      data: body,
      jsonBody: false,
      headers: {
        'Accept-Language': language,
      },
    })

  return {
    create,
    createVisualization,
    getMeta,
    getPublic,
  }
}
