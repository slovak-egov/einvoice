import {CONFIG} from '../appSettings'

export const invoiceFormats = {
  UBL: 'ubl2.1',
  D16B: 'd16b',
}

export const swaggerUrl = 'https://generator.swagger.io/?url=https://raw.githubusercontent.com/slovak-egov/einvoice/main/docs/swagger.yml'

// This is temporary solution to send session token in query
export const invoiceDownloadXmlUrl = (id) => {
  let url = `${CONFIG.apiServerUrl}/invoices/${id}/detail`
  const token = localStorage.getItem('sessionToken')
  if (token != null) url += `?token=${token}`
  return url
}

export const invoiceDownloadPdfUrl = (id) => {
  let url = `${CONFIG.apiServerUrl}/invoices/${id}/visualization`
  const token = localStorage.getItem('sessionToken')
  if (token != null) url += `?token=${token}`
  return url
}

// This needs to be function, so URL is generated with current localStorage content
export const getLogoutUrl = () =>
  `${CONFIG.apiServerUrl}/upvs/logout?token=${localStorage.getItem('oboToken')}&callback=${CONFIG.logoutCallbackUrl}`

export const exampleInvoiceUrl = (format, name) =>
  `${CONFIG.apiServerUrl}/data/examples/${format}/${name}.xml`
