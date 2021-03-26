import {CONFIG} from '../appSettings'
import {capitalizeFirstChar} from './helpers'

export const invoiceFormats = {
  UBL: 'ubl2.1',
  D16B: 'd16b',
}

export const swaggerUrl = 'https://generator.swagger.io/?url=https://raw.githubusercontent.com/slovak-egov/einvoice/main/docs/swagger.yml'

// This needs to be function, so URL is generated with current localStorage content
export const getLogoutUrl = (oboToken) =>
  `${CONFIG.apiServerUrl}/upvs/logout?token=${oboToken || localStorage.getItem('oboToken')}&callback=${CONFIG.logoutCallbackUrl}`

export const exampleInvoiceUrl = (format, name) =>
  `${CONFIG.apiServerUrl}/data/examples/${format}/${name}.xml`

// keep in sync with internal/entity/invoice.go
export const notificationStates = {
  NOT_SENT: 'not_sent',
  SENT: 'sent',
  SENDING: 'sending',
}

export const allowedAttachmentMimeTypes = [
  'text/csv', 'application/pdf', 'image/png', 'image/jpeg',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export const invoiceTypes = {
  INVOICE: 'invoice',
  CREDIT_NOTE: 'creditNote',
}

export const rootAttributes = (invoiceType) => ({
  'xmlns': [{text: `urn:oasis:names:specification:ubl:schema:xsd:${capitalizeFirstChar(invoiceType)}-2`}],
  'xmlns:cac': [{text: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2'}],
  'xmlns:cbc': [{text: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'}],
})

export const dataTypes = {
  BINARY_OBJECT: 'Binary object',
  PERCENTAGE: 'Percentage',
  AMOUNT: 'Amount',
  QUANTITY: 'Quantity',
  DATE: 'Date',
  CODE: 'Code',
}

export const upvsForbiddenSubstitutionError = 'authorization.upvs.forbiddenSubstitutionType'
