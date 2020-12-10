export default (api) => {

  const prepareRequest = (params) =>
    api.apiRequest(api.prefixRoute(params, `/users/${localStorage.getItem('userId')}`))

  const getInfo = () => prepareRequest({route: ''})

  const updateInfo = (data) => prepareRequest({method: 'PATCH', route: '', data})

  const getMyInvoices = ({supplied, received, ...otherParams}) => {
    const queryParams = api.getInvoicesQueryParams(otherParams)
    queryParams.push(['received', received])
    queryParams.push(['supplied', supplied])
    return prepareRequest({
      route: `/invoices?${new URLSearchParams(queryParams)}`,
    })
  }

  const getSubstituteIds = () => prepareRequest({route: '/substitutes'})

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
    getSubstituteIds,
    removeSubstitute,
    updateInfo,
  }
}
