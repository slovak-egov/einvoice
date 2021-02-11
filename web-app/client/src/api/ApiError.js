import ExtendableError from 'es6-error'

export default class ApiError extends ExtendableError {
  constructor({statusCode, message, detail}) {
    super(`Http code: ${statusCode} - ${message}`)
    this.statusCode = statusCode
    this.message = message
    this.detail = detail
  }
}
