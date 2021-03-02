import {CONFIG} from '../appSettings'

export const invoiceFormats = {
  UBL: 'ubl2.1',
  D16B: 'd16b',
}

export const swaggerUrl = 'https://generator.swagger.io/?url=https://raw.githubusercontent.com/slovak-egov/einvoice/main/docs/swagger.yml'

// This needs to be function, so URL is generated with current localStorage content
export const getLogoutUrl = () =>
  `${CONFIG.apiServerUrl}/upvs/logout?token=${localStorage.getItem('oboToken')}&callback=${CONFIG.logoutCallbackUrl}`

export const exampleInvoiceUrl = (format, name) =>
  `${CONFIG.apiServerUrl}/data/examples/${format}/${name}.xml`

export const rootAttributes = {
  'xmlns': [{text: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2'}],
  'xmlns:cac': [{text: 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2'}],
  'xmlns:cbc': [{text: 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'}],
}

// keep in sync with internal/entity/invoice.go
export const notificationStates = {
  NOT_SENT: 'not_sent',
  SENT: 'sent',
  SENDING: 'sending',
}

// keep in sync with internal/entity/invoice.go
export const partiesTypes = {
  SLOVAK: 'slovakParties',
  FOREIGN_SUPPLIER: 'foreignSupplier',
  FOREIGN_CUSTOMER: 'foreignCustomer',
}

export const allowedAttachmentMimeTypes = [
  'text/csv', 'application/pdf', 'image/png', 'image/jpeg',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
