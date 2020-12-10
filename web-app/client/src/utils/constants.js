import {CONFIG} from '../appSettings'

export const invoiceFormats = {
  UBL: 'ubl2.1',
  D16B: 'd16b',
}

export const swaggerUrl = 'https://generator.swagger.io/?url=https://raw.githubusercontent.com/slovak-egov/einvoice/main/docs/swagger.yml'
// This is temporary solution to send session token in query
export const invoiceDownloadXmlUrl = (id, token) => {
  let url = `${CONFIG.apiServerUrl}/invoices/${id}/detail`
  if (token != null) url += `?token=${token}`
  return url
}
export const invoiceDownloadPdfUrl = (id, token) => {
  let url = `${CONFIG.apiServerUrl}/invoices/${id}/visualization`
  if (token != null) url += `?token=${token}`
  return url
}
