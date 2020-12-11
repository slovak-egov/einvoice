import {CONFIG} from '../appSettings'
import ApiError from './ApiError'
import createUsersApi from './users'
import createInvoicesApi from './invoices'

export default class Api {

  constructor() {
    this.users = createUsersApi(this)
    this.invoices = createInvoicesApi(this)
  }

  validateResponse = ({status, body}) => {
    if (status < 200 || status >= 300) {
      throw new ApiError({statusCode: status, message: body && body.error})
    }
  }

  loginWithSlovenskoSkToken = (token) =>
    this.apiRequest({
      route: '/login',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

  logout = () => this.apiRequest({route: '/logout'})

  getInvoicesQueryParams = ({formats, ico, nextId, test}) => {
    const queryParams = formats.map((f) => ['format', f])
    queryParams.push(['test', test])
    if (nextId) queryParams.push(['nextId', nextId])
    if (ico) queryParams.push(['ico', ico])
    return queryParams
  }

  apiRequest = (params) => {
    // Add authorization header if logged in
    if (localStorage.getItem('token')) {
      params = {
        ...params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          ...params.headers,
        },
      }
    }

    return this.standardRequest({
      ...params,
      route: `${CONFIG.apiServerUrl}${params.route}`,
    })
  }

  prefixRoute = (requestParams, prefix) => ({
    ...requestParams,
    route: `${prefix}${requestParams.route}`,
  })

  async standardRequest({method, data, route, jsonResponse = true, jsonBody = true, ...opts}) {
    const response = await fetch(route, {
      method,
      body: jsonBody ? JSON.stringify(data) : data,
      ...opts,
    })

    const body = await response.json()
    this.validateResponse({status: response.status, body})
    return body
  }
}
