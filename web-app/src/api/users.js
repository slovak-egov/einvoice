export default (api) => {

  const prepareRequest = (params) =>
    api.apiRequest(api.prefixRoute(params, `/users/${localStorage.getItem('userId')}`))

  const getInfo = () => prepareRequest({route: ''})

  const updateInfo = (data) => prepareRequest({method: 'PATCH', route: '', data})

  const getMyInvoices = (query, startId) => {
    const queryParams = new URLSearchParams(query)
    if (startId) queryParams.set('startId', startId)
    return prepareRequest({route: `/invoices?${queryParams}`})
  }

  const getSubstituteIds = () => prepareRequest({route: '/substitutes'})

  const getOrganizationIds = () => prepareRequest({route: '/organizations'})

  const removeSubstitute = (id) =>
    prepareRequest({
      method: 'DELETE',
      route: '/substitutes',
      data: [id],
    })

  const addSubstitute = (id) =>
    prepareRequest({
      method: 'POST',
      route: '/substitutes',
      data: [id],
    })

  return {
    addSubstitute,
    getInfo,
    getMyInvoices,
    getOrganizationIds,
    getSubstituteIds,
    removeSubstitute,
    updateInfo,
  }
}
