import {CONFIG} from '../appSettings'
import ApiError from './ApiError'
import createUsersApi from './users'
import createInvoicesApi from './invoices'
import createDocumentationApi from './documentation'

export default class Api {

  constructor() {
    this.users = createUsersApi(this)
    this.invoices = createInvoicesApi(this)
    this.documentation = createDocumentationApi(this)
  }

  login = (token) =>
    this.apiRequest({
      route: '/login',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

  logout = () => this.apiRequest({route: '/logout'})

  apiRequest = (params) => {
    // Add authorization header if logged in
    const sessionToken = localStorage.getItem('sessionToken')
    if (sessionToken) {
      params = {
        ...params,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
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

  getResponseParser = (response) => {
    switch (response.headers.get('Content-Type')) {
      case 'application/json': return response.json()
      case 'application/zip': return response.blob()
      default: return response.text()
    }
  }

  async standardRequest({method, data, route, jsonResponse = true, jsonBody = true, ...opts}) {
    const response = await fetch(route, {
      method,
      body: jsonBody ? JSON.stringify(data) : data,
      ...opts,
    })

    const body = await this.getResponseParser(response)

    if (!response.ok) {
      throw new ApiError({
        statusCode: response.status,
        message: body && body.error,
        detail: body && body.detail,
      })
    }
    return body
  }
}
