export default (api) => {
  const prepareRequest = (params) =>
    api.apiRequest(api.prefixRoute(params, '/drafts'))

  const getAll = () => prepareRequest({route: ''})

  const remove = (id) => prepareRequest({method: 'DELETE', route: `/${id}`})

  const create = (name, data) =>
    prepareRequest({method: 'POST', route: '', data: {name, data}})

  const update = ({id, name, data}) =>
    prepareRequest({method: 'PATCH', route: `/${id}`, data: {name, data}})

  const get = (id) => prepareRequest({route: `/${id}`})

  return {
    create,
    update,
    remove,
    get,
    getAll,
  }
}
