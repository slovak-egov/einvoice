import {CONFIG} from '../appSettings'
import ApiError from './ApiError'

export default class Api {

  validateResponse = ({status, body}) => {
    if (status < 200 || status >= 300) {
      throw new ApiError({statusCode: status, message: body && body.error})
    }
  }

  getUserSubstituteIds = async () =>
    await this.apiRequest({
      route: `/users/${localStorage.getItem('userId')}/substitutes`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

  removeUserSubstitute = async (id) =>
    await this.apiRequest({
      method: 'DELETE',
      route: `/users/${localStorage.getItem('userId')}/substitutes`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      data: [id],
    })

  addUserSubstitute = async (id) =>
    await this.apiRequest({
      method: 'POST',
      route: `/users/${localStorage.getItem('userId')}/substitutes`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      data: [id],
    })

  getUserInfo = async () =>
    await this.apiRequest({
      route: `/users/${localStorage.getItem('userId')}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

  updateUser = async (data) =>
    await this.apiRequest({
      method: 'PATCH',
      route: `/users/${localStorage.getItem('userId')}`,
      data,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

  loginWithSlovenskoSkToken = async (token) =>
    await this.apiRequest({
      route: '/login',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

  logout = async () =>
    await this.apiRequest({
      route: '/logout',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      jsonResponse: false,
    })

  getMyInvoices = async ({formats, supplied, received}) => {
    const userId = localStorage.getItem('userId')
    const queryParams = formats.map((f) => ['format', f])
    queryParams.push(['received', received])
    queryParams.push(['supplied', supplied])
    return await this.apiRequest({
      route: `/users/${userId}/invoices?${new URLSearchParams(queryParams)}`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
  }

  getPublicInvoices = async ({formats}) => {
    const queryParams = formats.map((f) => ['format', f])
    return await this.apiRequest({
      route: `/invoices?${new URLSearchParams(queryParams)}`,
    })
  }

  getInvoiceDetail = async (id) =>
    await this.apiRequest({
      route: `/invoices/${id}/detail`,
      jsonResponse: false,
    })

  getInvoiceMeta = async (id) => {
    return await this.apiRequest({
      route: `/invoices/${id}`,
    })
  }

  createInvoice = async (formData) =>
    await this.apiRequest({
      method: 'POST',
      route: '/invoices',
      data: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      jsonBody: false,
    })

  apiRequest = (params) =>
    this.standardRequest({
      ...params,
      route: `${CONFIG.apiServerUrl}${params.route}`,
    })

  async standardRequest({method, data, route, jsonResponse = true, jsonBody = true, ...opts}) {
    let contentType = {}
    if (jsonBody) {
      contentType = {'Content-Type': 'application/json'}
    }
    const response = await fetch(route, {
      method,
      body: jsonBody ? JSON.stringify(data) : data,
      ...opts,
      headers: {
        ...contentType,
        ...opts.headers,
      },
    })

    const body = jsonResponse ? await response.json() : await response.text()
    this.validateResponse({status: response.status, body})
    return body
  }
}
