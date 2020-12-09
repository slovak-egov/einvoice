import {CONFIG} from '../appSettings'

export const invoiceFormats = {
  UBL: 'ubl2.1',
  D16B: 'd16b',
}

export const swaggerUrl = 'https://generator.swagger.io/?url=https://raw.githubusercontent.com/slovak-egov/einvoice/main/docs/swagger.yml'
export const invoiceDownloadXmlUrl = (id) => `${CONFIG.apiServerUrl}/invoices/${id}/detail`
export const invoiceDownloadPdfUrl = (id) => `${CONFIG.apiServerUrl}/invoices/${id}/visualization`
